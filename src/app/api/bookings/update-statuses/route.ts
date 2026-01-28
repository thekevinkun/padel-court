import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Debounce to prevent duplicate calls
let lastRunTimestamp = 0;
const DEBOUNCE_MS = 3000; // 3 seconds

// Endpoint to automatically update booking statuses
export async function POST(_request: NextRequest) {
  try {
    // Prevent duplicate calls within 3 seconds
    const now = Date.now();
    if (now - lastRunTimestamp < DEBOUNCE_MS) {
      console.log("⏭️ Skipping duplicate update-statuses call (debounced)");
      return NextResponse.json({
        success: true,
        message: "Status update skipped (debounced)",
        debounced: true,
      });
    }
    lastRunTimestamp = now;

    console.log("🔄 Starting automatic status update...");

    // Initialize Supabase client
    const supabase = createServerClient();
    const nowDate = new Date();
    const options = { timeZone: "Asia/Makassar" };
    const today = nowDate.toLocaleDateString("en-CA", options);
    console.log("🕐 Current time (WITA):", nowDate.toLocaleString("en-CA"));
    console.log("📅 Today date:", today);

    // EXPIRE VENUE PAYMENTS
    const { data: bookingsToExpire, error: fetchError } = await supabase
      .from("bookings")
      .select(
        "id, booking_ref, customer_name, date, time_end, remaining_balance",
      )
      .eq("status", "PAID")
      .eq("session_status", "UPCOMING")
      .eq("require_deposit", true)
      .eq("venue_payment_received", false)
      .eq("venue_payment_expired", false)
      .gt("remaining_balance", 0);

    if (fetchError) {
      console.error("Error fetching bookings to expire:", fetchError);
    }

    // Expire venue payments for bookings where booking time has passed
    let expiredCount = 0;
    if (bookingsToExpire) {
      for (const booking of bookingsToExpire) {
        const bookingDate = new Date(booking.date);
        const [hours, minutes, seconds] = booking.time_end
          .split(":")
          .map(Number);
        bookingDate.setHours(hours, minutes, seconds || 0, 0);

        // If booking time has passed, expire venue payment and cancel session
        if (nowDate > bookingDate) {
          await supabase
            .from("bookings")
            .update({
              venue_payment_expired: true,
              session_status: "CANCELLED",
            })
            .eq("id", booking.id);

          // Create notification for expired venue payment
          await supabase.from("admin_notifications").insert({
            booking_id: booking.id,
            type: "CANCELLATION",
            title: "⏰ Venue Payment Expired",
            message: `Booking ${booking.booking_ref} - ${
              booking.customer_name
            } failed to pay IDR ${booking.remaining_balance.toLocaleString(
              "id-ID",
            )} remaining balance. Session cancelled automatically.`,
            read: false,
          });

          expiredCount++;
          console.log(
            `⏰ Expired venue payment & cancelled session: ${booking.booking_ref}`,
          );
        }
      }
    }

    // AUTO-START SESSIONS (UPCOMING → IN_PROGRESS)
    const { data: bookingsToStart, error: startFetchError } = await supabase
      .from("bookings")
      .select(
        "id, booking_ref, customer_name, date, time, time_start, time_end, require_deposit, venue_payment_received",
      )
      .eq("status", "PAID")
      .eq("session_status", "UPCOMING");

    if (startFetchError) {
      console.error("Error fetching bookings to start:", startFetchError);
    }

    let startedCount = 0;
    let autoCompletedFromUpcoming = 0;
    console.log(
      `📋 Found ${bookingsToStart?.length || 0} UPCOMING bookings to check`,
    );

    // Check each booking to see if it should be started
    if (bookingsToStart) {
      for (const booking of bookingsToStart) {
        const bookingDate = new Date(booking.date);
        const [startHours, startMinutes, startSeconds] = booking.time_start
          .split(":")
          .map(Number);
        const [endHours, endMinutes, endSeconds] = booking.time_end
          .split(":")
          .map(Number);

        const startTime = new Date(bookingDate);
        startTime.setHours(startHours, startMinutes, startSeconds || 0, 0);

        const endTime = new Date(bookingDate);
        endTime.setHours(endHours, endMinutes, endSeconds || 0, 0);

        console.log(`🔍 Checking ${booking.booking_ref}:`);
        console.log(` Date: ${booking.date}, Time: ${booking.time}`);
        console.log(` Start: ${startTime.toLocaleString("en-ID")}`);
        console.log(` End: ${endTime.toLocaleString("en-ID")}`);
        console.log(` Now: ${nowDate.toLocaleString("en-ID")}`);
        console.log(
          ` Is active? ${nowDate >= startTime && nowDate <= endTime}`,
        );
        console.log(` Has passed? ${nowDate > endTime}`);

        // If booking time has completely passed, auto-complete it
        if (nowDate > endTime) {
          console.log(
            `⏩ Booking time passed, auto-completing: ${booking.booking_ref}`,
          );
          await supabase
            .from("bookings")
            .update({
              session_status: "COMPLETED",
              checked_out_at: nowDate.toISOString(),
            })
            .eq("id", booking.id);

          // Create notification for auto-completed session
          await supabase.from("admin_notifications").insert({
            booking_id: booking.id,
            type: "SESSION_COMPLETED",
            title: "🏁 Session Auto-Completed",
            message: `Booking ${booking.booking_ref} - ${booking.customer_name}'s session at ${booking.time} was automatically completed.`,
            read: false,
          });

          autoCompletedFromUpcoming++;
          console.log(
            `🏁 Auto-completed (from UPCOMING): ${booking.booking_ref}`,
          );
          continue;
        }

        // Check if current time is within booking window
        if (nowDate >= startTime && nowDate <= endTime) {
          // Skip if deposit booking without venue payment
          if (booking.require_deposit && !booking.venue_payment_received) {
            console.log(
              `⏭️ Skipping auto-start for ${booking.booking_ref}: venue payment not received`,
            );
            continue;
          }

          await supabase
            .from("bookings")
            .update({
              session_status: "IN_PROGRESS",
              checked_in_at: nowDate.toISOString(),
            })
            .eq("id", booking.id);

          // Create notification for auto-started session
          await supabase.from("admin_notifications").insert({
            booking_id: booking.id,
            type: "SESSION_STARTED",
            title: "🎾 Session Auto-Started",
            message: `Booking ${booking.booking_ref} - ${booking.customer_name}'s session at ${booking.time} started automatically.`,
            read: false,
          });

          startedCount++;
          console.log(`🎾 Auto-started session: ${booking.booking_ref}`);
        }
      }
    }

    // AUTO-COMPLETE SESSIONS (IN_PROGRESS → COMPLETED)
    const { data: bookingsToComplete, error: completeFetchError } =
      await supabase
        .from("bookings")
        .select("id, booking_ref, customer_name, date, time, time_end")
        .eq("session_status", "IN_PROGRESS");

    if (completeFetchError) {
      console.error("Error fetching bookings to complete:", completeFetchError);
    }

    let completedCount = 0;
    if (bookingsToComplete) {
      for (const booking of bookingsToComplete) {
        const bookingDate = new Date(booking.date);
        const [hours, minutes, seconds] = booking.time_end
          .split(":")
          .map(Number);
        const endTime = new Date(bookingDate);
        endTime.setHours(hours, minutes, seconds || 0, 0);

        if (nowDate > endTime) {
          await supabase
            .from("bookings")
            .update({
              session_status: "COMPLETED",
              checked_out_at: nowDate.toISOString(),
            })
            .eq("id", booking.id);

          // Create notification for auto-completed session
          await supabase.from("admin_notifications").insert({
            booking_id: booking.id,
            type: "SESSION_COMPLETED",
            title: "🏁 Session Auto-Completed",
            message: `Booking ${booking.booking_ref} - ${booking.customer_name}'s session at ${booking.time} ended automatically.`,
            read: false,
          });

          completedCount++;
          console.log(
            `🏁 Auto-completed (from IN_PROGRESS): ${booking.booking_ref}`,
          );
        }
      }
    }

    // SUMMARY
    const totalCompleted = completedCount + autoCompletedFromUpcoming;
    const summary = {
      timestamp: nowDate.toISOString(),
      venuePaymentsExpired: expiredCount,
      sessionsStarted: startedCount,
      sessionsCompleted: totalCompleted,
      sessionsCompletedFromUpcoming: autoCompletedFromUpcoming,
      sessionsCompletedFromInProgress: completedCount,
      totalUpdates: expiredCount + startedCount + totalCompleted,
    };

    console.log("✅ Status update complete:", summary);

    return NextResponse.json({
      success: true,
      message: "Booking statuses updated successfully",
      summary,
    });
  } catch (error) {
    console.error("💥 Error updating statuses:", error);
    return NextResponse.json(
      { error: "Failed to update statuses" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

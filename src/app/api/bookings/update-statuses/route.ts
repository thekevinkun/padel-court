import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting automatic status update...");

    const supabase = createServerClient();
    const now = new Date();
    const options = { timeZone: "Asia/Makassar" };
    const today = now.toLocaleDateString("en-CA", options);

    console.log(
      "🕐 Current time (WITA):",
      now.toLocaleString("id-ID", options)
    );
    console.log("📅 Today date:", today);

    // EXPIRE VENUE PAYMENTS & CANCEL SESSIONS
    const { data: bookingsToExpire, error: fetchError } = await supabase
      .from("bookings")
      .select("id, booking_ref, date, time, remaining_balance")
      .eq("status", "PAID")
      .eq("require_deposit", true)
      .eq("venue_payment_received", false)
      .eq("venue_payment_expired", false)
      .gt("remaining_balance", 0);

    if (fetchError) {
      console.error("Error fetching bookings to expire:", fetchError);
    }

    let expiredCount = 0;
    if (bookingsToExpire) {
      for (const booking of bookingsToExpire) {
        const bookingDate = new Date(booking.date);
        const timeEnd = booking.time.split(" - ")[1];
        const [hours, minutes] = timeEnd.split(":").map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);

        if (now > bookingDate) {
          await supabase
            .from("bookings")
            .update({
              venue_payment_expired: true,
              session_status: "CANCELLED",
            })
            .eq("id", booking.id);

          expiredCount++;
          console.log(
            `⏰ Expired venue payment & cancelled session: ${booking.booking_ref}`
          );
        }
      }
    }

    // AUTO-START SESSIONS (UPCOMING → IN_PROGRESS)
    // Also auto-complete bookings that were never started but time passed
    const { data: bookingsToStart, error: startFetchError } = await supabase
      .from("bookings")
      .select(
        "id, booking_ref, date, time, require_deposit, venue_payment_received"
      )
      .eq("status", "PAID")
      .eq("session_status", "UPCOMING");
    // Removed .eq("date", today) to check ALL upcoming bookings

    if (startFetchError) {
      console.error("Error fetching bookings to start:", startFetchError);
    }

    let startedCount = 0;
    let autoCompletedFromUpcoming = 0;

    console.log(
      `📋 Found ${bookingsToStart?.length || 0} UPCOMING bookings to check`
    );

    if (bookingsToStart) {
      for (const booking of bookingsToStart) {
        const bookingDate = new Date(booking.date);
        const [timeStart, timeEnd] = booking.time.split(" - ");

        const [startHours, startMinutes] = timeStart.split(":").map(Number);
        const [endHours, endMinutes] = timeEnd.split(":").map(Number);

        const startTime = new Date(bookingDate);
        startTime.setHours(startHours, startMinutes, 0, 0);

        const endTime = new Date(bookingDate);
        endTime.setHours(endHours, endMinutes, 0, 0);

        console.log(`🔍 Checking ${booking.booking_ref}:`);
        console.log(`   Date: ${booking.date}, Time: ${booking.time}`);
        console.log(`   Start: ${startTime.toLocaleString("id-ID")}`);
        console.log(`   End: ${endTime.toLocaleString("id-ID")}`);
        console.log(`   Now: ${now.toLocaleString("id-ID")}`);
        console.log(`   Is active? ${now >= startTime && now <= endTime}`);
        console.log(`   Has passed? ${now > endTime}`);

        // If booking time has completely passed, auto-complete it
        if (now > endTime) {
          console.log(
            `⏩ Booking time passed, auto-completing: ${booking.booking_ref}`
          );

          await supabase
            .from("bookings")
            .update({
              session_status: "COMPLETED",
              checked_out_at: now.toISOString(),
            })
            .eq("id", booking.id);

          autoCompletedFromUpcoming++;
          console.log(
            `🏁 Auto-completed (from UPCOMING): ${booking.booking_ref}`
          );
          continue; // Skip to next booking
        }

        // Check if current time is within booking window
        if (now >= startTime && now <= endTime) {
          // Skip if deposit booking without venue payment
          if (booking.require_deposit && !booking.venue_payment_received) {
            console.log(
              `⏭️ Skipping auto-start for ${booking.booking_ref}: venue payment not received`
            );
            continue;
          }

          await supabase
            .from("bookings")
            .update({
              session_status: "IN_PROGRESS",
              checked_in_at: now.toISOString(),
            })
            .eq("id", booking.id);

          startedCount++;
          console.log(`🎾 Auto-started session: ${booking.booking_ref}`);
        }
      }
    }

    // AUTO-COMPLETE SESSIONS (IN_PROGRESS → COMPLETED)
    const { data: bookingsToComplete, error: completeFetchError } =
      await supabase
        .from("bookings")
        .select("id, booking_ref, date, time")
        .eq("session_status", "IN_PROGRESS");

    if (completeFetchError) {
      console.error("Error fetching bookings to complete:", completeFetchError);
    }

    let completedCount = 0;
    if (bookingsToComplete) {
      for (const booking of bookingsToComplete) {
        const bookingDate = new Date(booking.date);
        const timeEnd = booking.time.split(" - ")[1];
        const [hours, minutes] = timeEnd.split(":").map(Number);

        const endTime = new Date(bookingDate);
        endTime.setHours(hours, minutes, 0, 0);

        if (now > endTime) {
          await supabase
            .from("bookings")
            .update({
              session_status: "COMPLETED",
              checked_out_at: now.toISOString(),
            })
            .eq("id", booking.id);

          completedCount++;
          console.log(
            `🏁 Auto-completed (from IN_PROGRESS): ${booking.booking_ref}`
          );
        }
      }
    }

    // SUMMARY
    const totalCompleted = completedCount + autoCompletedFromUpcoming;
    const summary = {
      timestamp: now.toISOString(),
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
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

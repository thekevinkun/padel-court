import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// This API should be called by a cron job every 5-15 minutes
// OR can be triggered manually by admins
// OR called on page load in dashboard
export async function POST(request: NextRequest) {
  try {
    console.log("Starting automatic status update...");

    const supabase = createServerClient();
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    /* EXPIRE VENUE PAYMENTS */
    // Find bookings where:
    // - Require deposit
    // - Not yet received venue payment
    // - Booking time has passed
    // - Not already marked as expired

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
        // Parse booking end time
        const bookingDate = new Date(booking.date);
        const timeEnd = booking.time.split(" - ")[1]; // "09:00 - 10:00" -> "10:00"
        const [hours, minutes] = timeEnd.split(":").map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);

        // Check if time has passed
        if (now > bookingDate) {
          await supabase
            .from("bookings")
            .update({ venue_payment_expired: true })
            .eq("id", booking.id);

          expiredCount++;
          console.log(`Expired venue payment: ${booking.booking_ref}`);
        }
      }
    }

    /* AUTO-START SESSIONS (UPCOMING → IN_PROGRESS) */
    // Find bookings where:
    // - Status is PAID
    // - Session status is UPCOMING
    // - Booking start time has arrived
    // - Booking end time hasn't passed yet

    const { data: bookingsToStart, error: startFetchError } = await supabase
      .from("bookings")
      .select("id, booking_ref, date, time")
      .eq("status", "PAID")
      .eq("session_status", "UPCOMING")
      .eq("date", today);

    if (startFetchError) {
      console.error("Error fetching bookings to start:", startFetchError);
    }

    let startedCount = 0;
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

        // Check if current time is within booking window
        if (now >= startTime && now <= endTime) {
          await supabase
            .from("bookings")
            .update({
              session_status: "IN_PROGRESS",
              checked_in_at: now.toISOString(),
            })
            .eq("id", booking.id);

          startedCount++;
          console.log(`Auto-started session: ${booking.booking_ref}`);
        }
      }
    }

    /* AUTO-COMPLETE SESSIONS (IN_PROGRESS → COMPLETED) */
    // Find bookings where:
    // - Session status is IN_PROGRESS
    // - Booking end time has passed

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

        // Check if end time has passed
        if (now > endTime) {
          await supabase
            .from("bookings")
            .update({
              session_status: "COMPLETED",
              checked_out_at: now.toISOString(),
            })
            .eq("id", booking.id);

          completedCount++;
          console.log(`Auto-completed session: ${booking.booking_ref}`);
        }
      }
    }

    /* SUMMARY */
    const summary = {
      timestamp: now.toISOString(),
      venuePaymentsExpired: expiredCount,
      sessionsStarted: startedCount,
      sessionsCompleted: completedCount,
      totalUpdates: expiredCount + startedCount + completedCount,
    };

    console.log("Status update complete:", summary);

    return NextResponse.json({
      success: true,
      message: "Booking statuses updated successfully",
      summary,
    });
  } catch (error) {
    console.error("Error updating statuses:", error);
    return NextResponse.json(
      { error: "Failed to update statuses" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for manual trigger or status check
export async function GET(request: NextRequest) {
  // Same logic as POST, or just return current status
  return POST(request);
}

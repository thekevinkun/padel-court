import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendBookingReminder } from "@/lib/email";

// API route to send reminder emails for upcoming bookings
// Scheduled to run every hour via cron job
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔔 Starting reminder email cron job...");

    // Initialize Supabase client
    const supabase = createServerClient();
    const now = new Date();

    // Calculate time window: 3-4 hours from now
    // (1-hour window to catch everything, runs every hour)
    const windowStart = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    console.log(
      `📅 Checking bookings between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`,
    );

    // Fetch paid, upcoming bookings that haven't received reminder yet
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        courts (name)
      `,
      )
      .eq("status", "PAID")
      .eq("session_status", "UPCOMING")
      .eq("reminder_sent", false); // Only bookings without reminder

    if (error) {
      console.error("❌ Error fetching bookings:", error);
      throw error;
    }

    console.log(`📋 Found ${bookings?.length || 0} bookings without reminders`);

    let sentCount = 0;
    let skippedCount = 0;

    if (bookings && bookings.length > 0) {
      for (const booking of bookings) {
        try {
          // Check if booking time is within 3-4 hour window
          const bookingDateTime = new Date(booking.date);
          const [hours, minutes] = booking.time
            .split(" - ")[0]
            .split(":")
            .map(Number);
          bookingDateTime.setHours(hours, minutes, 0, 0);

          const hoursUntil =
            (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

          // Send if within 3-4 hour window
          if (hoursUntil >= 3 && hoursUntil <= 4) {
            await sendBookingReminder({
              customerName: booking.customer_name,
              customerEmail: booking.customer_email,
              bookingRef: booking.booking_ref,
              courtName: booking.courts.name,
              date: new Date(booking.date).toLocaleDateString("en-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              time: booking.time,
              requireDeposit: booking.require_deposit,
              remainingBalance: booking.remaining_balance,
              venuePaymentReceived: booking.venue_payment_received,
            });

            // Mark as sent
            await supabase
              .from("bookings")
              .update({
                reminder_sent: true,
                reminder_sent_at: now.toISOString(),
              })
              .eq("id", booking.id);

            sentCount++;
            console.log(
              `✅ Reminder sent: ${booking.booking_ref} (${hoursUntil.toFixed(1)}hrs away)`,
            );
          } else {
            skippedCount++;
            console.log(
              `⏭️ Skipped: ${booking.booking_ref} (${hoursUntil.toFixed(1)}hrs away - outside window)`,
            );
          }
        } catch (emailError) {
          console.error(
            `❌ Failed to send reminder for ${booking.booking_ref}:`,
            emailError,
          );
          // Continue with other bookings
        }
      }
    }

    const summary = {
      timestamp: now.toISOString(),
      sent: sentCount,
      skipped: skippedCount,
      total: bookings?.length || 0,
    };

    console.log("✅ Reminder cron job complete:", summary);

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminder emails`,
      summary,
    });
  } catch (error) {
    console.error("💥 Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error },
      { status: 500 },
    );
  }
}

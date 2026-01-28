import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

// Webhook endpoint to handle Midtrans payment notifications
export async function POST(request: NextRequest) {
  try {
    // Parse notification payload
    const notification = await request.json();
    console.log("📩 Webhook received:", notification);

    // Initialize Midtrans API client
    const apiClient = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    // Verify notification authenticity
    const statusResponse =
      await apiClient.transaction.notification(notification);

    // Extract relevant fields
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    console.log(
      `📊 Transaction ${orderId}: ${transactionStatus}, Fraud: ${fraudStatus}`,
    );

    // Initialize Supabase client
    const supabase = createServerClient();

    // Extract booking reference from order ID
    const bookingRef = orderId.replace("BOOKING-", "");

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
          *,
          courts (name, description)
        `,
      )
      .eq("booking_ref", bookingRef)
      .single();

    if (bookingError || !booking) {
      console.error("❌ Booking not found:", bookingRef);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Determine payment status for our database
    let paymentStatus = "PENDING";
    let _shouldUpdateBooking = false;
    let newBookingStatus: string | null = null;

    // SUCCESS CASES
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "accept" || transactionStatus === "settlement") {
        paymentStatus = "SUCCESS";
        _shouldUpdateBooking = true;
        newBookingStatus = "PAID";
      }
    }
    // PENDING CASES
    else if (transactionStatus === "pending") {
      paymentStatus = "PENDING";
      // Keep booking as PENDING, don't update
    }
    // FAILURE CASES - EXPANDED
    else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire" ||
      transactionStatus === "failure" || // explicit failure status
      fraudStatus === "deny" || // fraud denial
      fraudStatus === "challenge" // fraud challenge (treat as failed)
    ) {
      paymentStatus = "FAILED";
      _shouldUpdateBooking = true;
      newBookingStatus = "CANCELLED";
    }

    // Update payment record
    const updateData: {
      midtrans_transaction_id: string;
      payment_type: string;
      payment_method: string;
      status: string;
      payment_response: unknown;
      updated_at: string;
      completed_at?: string;
    } = {
      midtrans_transaction_id: statusResponse.transaction_id,
      payment_type: paymentType,
      payment_method: statusResponse.payment_type,
      status: paymentStatus,
      payment_response: statusResponse,
      updated_at: new Date().toISOString(),
    };

    // Add completed_at timestamp if payment successful
    if (paymentStatus === "SUCCESS") {
      updateData.completed_at = new Date().toISOString();
    }

    // Perform payment record update
    await supabase
      .from("payments")
      .update(updateData)
      .eq("midtrans_order_id", orderId);

    // Handle SUCCESS
    if (paymentStatus === "SUCCESS" && newBookingStatus === "PAID") {
      console.log("✅ Payment SUCCESS for booking:", bookingRef);

      // Calculate actual fee (for records only)
      let midtransFee = 0;
      if (paymentType === "credit_card") {
        midtransFee = Math.round(booking.total_amount * 0.029 + 2000); // 2.9% + 2000
      } else if (
        paymentType === "gopay" ||
        paymentType === "shopeepay" ||
        paymentType === "dana"
      ) {
        midtransFee = Math.round(booking.total_amount * 0.02); // 2%
      } else if (paymentType === "qris" || paymentType === "other_qris") {
        midtransFee = Math.round(booking.total_amount * 0.007); // 0.7%
      } else if (
        paymentType.includes("va") ||
        paymentType.includes("bank_transfer")
      ) {
        midtransFee = 4000; // Flat fee
      }

      // Update booking status to PAID
      await supabase
        .from("bookings")
        .update({
          status: "PAID",
          paid_at: new Date().toISOString(),
          payment_method: paymentType,
          payment_fee: midtransFee,
        })
        .eq("id", booking.id);

      // Confirm ALL time slots are locked
      const { data: relatedSlots } = await supabase
        .from("booking_time_slots")
        .select("time_slot_id")
        .eq("booking_id", booking.id);

      if (relatedSlots && relatedSlots.length > 0) {
        const slotIds = relatedSlots.map((r) => r.time_slot_id);
        await supabase
          .from("time_slots")
          .update({ available: false })
          .in("id", slotIds);
      }

      // Check if its deposit
      // If total_amount is less than subtotal, it's a deposit payment
      const isDepositPayment = booking.total_amount < booking.subtotal;

      // Create admin notification
      const notificationMessage = isDepositPayment
        ? `Booking ${bookingRef} has been paid. Total: IDR ${booking.total_amount.toLocaleString(
            "id-ID",
          )} via ${paymentType}. Type: Deposit. Customer: ${
            booking.customer_name
          }.`
        : `Booking ${bookingRef} has been paid. Total: IDR ${booking.total_amount.toLocaleString(
            "id-ID",
          )} via ${paymentType}. Type: Full Payment. Customer: ${
            booking.customer_name
          }.`;

      // Create success notification
      await supabase.from("admin_notifications").insert({
        booking_id: booking.id,
        type: "PAYMENT_RECEIVED",
        title: "New Payment Received",
        message: notificationMessage,
        read: false,
      });

      // Send confirmation email
      try {
        const { sendBookingConfirmation } = await import("@/lib/email");
        await sendBookingConfirmation({
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
          numberOfPlayers: booking.number_of_players,
          totalAmount: booking.total_amount,
          requireDeposit: booking.require_deposit,
          depositAmount: booking.deposit_amount,
          remainingBalance: booking.remaining_balance,
          paymentMethod: paymentType,
        });
        console.log("✅ Confirmation email sent");
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }

      // Check if booking is < 3 hours away - send reminder immediately
      try {
        const bookingDateTime = new Date(booking.date);
        const [hours, minutes] = booking.time
          .split(" - ")[0]
          .split(":")
          .map(Number);
        bookingDateTime.setHours(hours, minutes, 0, 0);

        const hoursUntilBooking = Math.round(
          (bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60),
        );

        if (hoursUntilBooking < 3 && hoursUntilBooking > 0) {
          console.log(
            `⚡ Booking is in ${hoursUntilBooking} hours - sending immediate reminder`,
          );

          const { sendBookingReminder } = await import("@/lib/email");
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

          // Mark reminder as sent
          await supabase
            .from("bookings")
            .update({
              reminder_sent: true,
              reminder_sent_at: new Date().toISOString(),
            })
            .eq("id", booking.id);

          console.log("✅ Immediate reminder email sent");
        } else {
          console.log(
            `📅 Booking is in ${hoursUntilBooking} hours - cron will handle reminder`,
          );
        }
      } catch (reminderError) {
        console.error("❌ Failed to send immediate reminder:", reminderError);
        // Don't fail the webhook if reminder fails
      }
    }
    // Handle PENDING
    else if (paymentStatus === "PENDING") {
      console.log("⏳ Payment PENDING for booking:", bookingRef);

      // Keep booking as PENDING (no status change needed)
      await supabase
        .from("bookings")
        .update({ status: "PENDING" })
        .eq("id", booking.id);
    }
    // Handle FAILURE
    else if (paymentStatus === "FAILED" && newBookingStatus === "CANCELLED") {
      console.log("❌ Payment FAILED for booking:", bookingRef);

      // Update booking to CANCELLED
      await supabase
        .from("bookings")
        .update({
          status: "CANCELLED",
          session_status: "CANCELLED", // ← ADD THIS LINE
        })
        .eq("id", booking.id);

      // Release ALL time slots
      const { data: relatedSlots } = await supabase
        .from("booking_time_slots")
        .select("time_slot_id")
        .eq("booking_id", booking.id);

      if (relatedSlots && relatedSlots.length > 0) {
        const slotIds = relatedSlots.map((r) => r.time_slot_id);
        await supabase
          .from("time_slots")
          .update({ available: true })
          .in("id", slotIds);
      }

      // Create failure notification
      await supabase.from("admin_notifications").insert({
        booking_id: booking.id,
        type: "PAYMENT_FAILED",
        title: "❌ Payment Failed",
        message: `Booking ${bookingRef} payment ${transactionStatus}. Slot released.`,
        read: false,
      });

      console.log("✅ Booking cancelled, slot released");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      stack?: string;
      ApiResponse?: unknown;
      httpStatusCode?: number;
    };
    console.error("❌ Webhook error:", error);

    // Log the full error for debugging
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      response: err.ApiResponse,
    });

    // If it's a Midtrans API error, we still return 200 to prevent retries
    // The failed page will handle the cancellation
    if (err.httpStatusCode || err.ApiResponse) {
      console.log(
        "⚠️ Midtrans API error - returning success to prevent webhook retry",
      );
      return NextResponse.json({
        success: true,
        note: "Midtrans API error - handled by client-side cancellation",
      });
    }

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: err.message,
      },
      { status: 500 },
    );
  }
}

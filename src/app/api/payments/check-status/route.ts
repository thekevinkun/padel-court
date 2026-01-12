import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingRef } = body;

    console.log(`Checking payment status for booking: ${bookingRef}`);

    if (!bookingRef) {
      return NextResponse.json(
        { error: "bookingRef is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_ref", bookingRef)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // If already paid or cancelled, return current status
    if (booking.status === "PAID" || booking.status === "CANCELLED") {
      return NextResponse.json({
        success: true,
        status: booking.status,
        message: `Booking is already ${booking.status}`,
      });
    }

    // Initialize Midtrans API client
    const apiClient = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const orderId = `BOOKING-${bookingRef}`;

    try {
      // Get transaction status from Midtrans
      const statusResponse = await apiClient.transaction.status(orderId);

      console.log("📊 Midtrans Status Check:", statusResponse);

      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
      const paymentType = statusResponse.payment_type;

      // Update payment record if exists
      await supabase
        .from("payments")
        .update({
          midtrans_transaction_id: statusResponse.transaction_id,
          payment_type: paymentType,
          payment_method: paymentType,
          payment_response: statusResponse,
          updated_at: new Date().toISOString(),
        })
        .eq("midtrans_order_id", orderId);

      // Handle different statuses
      let bookingStatus = booking.status;
      let message = "";

      if (
        transactionStatus === "capture" ||
        transactionStatus === "settlement"
      ) {
        if (fraudStatus === "accept" || transactionStatus === "settlement") {
          // Payment successful
          bookingStatus = "PAID";
          message = "Payment confirmed";

          await supabase
            .from("bookings")
            .update({
              status: "PAID",
              paid_at: new Date().toISOString(),
              payment_method: paymentType,
            })
            .eq("id", booking.id);

          await supabase
            .from("time_slots")
            .update({ available: false })
            .eq("id", booking.time_slot_id);

          // Create success notification
          await supabase.from("admin_notifications").insert({
            booking_id: booking.id,
            type: "PAYMENT_RECEIVED",
            title: "💰 Payment Received",
            message: `Booking ${bookingRef} paid ${booking.total_amount.toLocaleString(
              "id-ID"
            )} via ${paymentType}`,
            read: false,
          });
        }
      } else if (transactionStatus === "pending") {
        bookingStatus = "PENDING";
        message = "Payment is pending";
      } else if (
        transactionStatus === "deny" ||
        transactionStatus === "cancel" ||
        transactionStatus === "expire" ||
        transactionStatus === "failure"
      ) {
        // Payment failed
        bookingStatus = "CANCELLED";
        message = "Payment failed";

        await supabase
          .from("bookings")
          .update({
            status: "CANCELLED",
            session_status: "CANCELLED",
          })
          .eq("id", booking.id);

        await supabase
          .from("time_slots")
          .update({ available: true })
          .eq("id", booking.time_slot_id);

        await supabase
          .from("payments")
          .update({ status: "FAILED" })
          .eq("midtrans_order_id", orderId);

        // Create failure notification
        await supabase.from("admin_notifications").insert({
          booking_id: booking.id,
          type: "PAYMENT_FAILED",
          title: "❌ Payment Failed",
          message: `Booking ${bookingRef} payment ${transactionStatus}. Slot released.`,
          read: false,
        });
      }

      return NextResponse.json({
        success: true,
        status: bookingStatus,
        transactionStatus,
        message,
      });
    } catch (midtransError: unknown) {
      const err = midtransError as {
        httpStatusCode?: number;
        ApiResponse?: { status_code?: string };
      };

      // If Midtrans returns 404, the transaction was never created
      if (
        err.httpStatusCode === 404 ||
        err.ApiResponse?.status_code === "404"
      ) {
        console.log(
          "❌ Transaction not found in Midtrans - payment page never loaded properly"
        );

        // Mark as failed
        await supabase
          .from("bookings")
          .update({
            status: "CANCELLED",
            session_status: "CANCELLED",
          })
          .eq("id", booking.id);

        await supabase
          .from("time_slots")
          .update({ available: true })
          .eq("id", booking.time_slot_id);

        await supabase
          .from("payments")
          .update({ status: "FAILED" })
          .eq("midtrans_order_id", orderId);

        // Create failure notification
        await supabase.from("admin_notifications").insert({
          booking_id: booking.id,
          type: "PAYMENT_FAILED",
          title: "❌ Payment Failed",
          message: `Booking ${bookingRef} payment failed to initialize. Slot released.`,
          read: false,
        });

        return NextResponse.json({
          success: true,
          status: "CANCELLED",
          message: "Payment failed - transaction not found",
        });
      }

      // If Midtrans returns 500, their system is having issues
      if (err.httpStatusCode === 500) {
        console.log("❌ Midtrans API error 500 - system issues");

        // Mark as failed since we can't verify
        await supabase
          .from("bookings")
          .update({
            status: "CANCELLED",
            session_status: "CANCELLED",
          })
          .eq("id", booking.id);

        await supabase
          .from("time_slots")
          .update({ available: true })
          .eq("id", booking.time_slot_id);

        await supabase
          .from("payments")
          .update({ status: "FAILED" })
          .eq("midtrans_order_id", orderId);

        // Create failure notification
        await supabase.from("admin_notifications").insert({
          booking_id: booking.id,
          type: "PAYMENT_FAILED",
          title: "❌ Payment Failed",
          message: `Booking ${bookingRef} payment failed (Midtrans system error). Slot released.`,
          read: false,
        });

        return NextResponse.json({
          success: true,
          status: "CANCELLED",
          message: "Payment failed - Midtrans system error",
        });
      }

      throw midtransError;
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check payment status",
        details: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

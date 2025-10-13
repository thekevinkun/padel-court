import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    
    console.log("📩 Webhook received:", notification);

    // Initialize Midtrans API client
    const apiClient = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    // Verify notification authenticity
    const statusResponse = await apiClient.transaction.notification(notification);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    console.log(`📊 Transaction ${orderId}: ${transactionStatus}, Fraud: ${fraudStatus}`);

    const supabase = createServerClient();

    // Extract booking reference from order ID
    const bookingRef = orderId.replace("BOOKING-", "");

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_ref", bookingRef)
      .single();

    if (bookingError || !booking) {
      console.error("❌ Booking not found:", bookingRef);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update payment record
    await supabase
      .from("payments")
      .update({
        midtrans_transaction_id: statusResponse.transaction_id,
        payment_type: paymentType,
        payment_method: statusResponse.payment_type,
        status: transactionStatus.toUpperCase(),
        payment_response: statusResponse,
        updated_at: new Date().toISOString(),
      })
      .eq("midtrans_order_id", orderId);

    // Handle different payment statuses
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      // Payment successful!
      if (fraudStatus === "accept" || transactionStatus === "settlement") {
        console.log("✅ Payment SUCCESS for booking:", bookingRef);

        // Update booking status to PAID
        await supabase
          .from("bookings")
          .update({
            status: "PAID",
            paid_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        // Confirm time slot is locked
        await supabase
          .from("time_slots")
          .update({ available: false })
          .eq("id", booking.time_slot_id);

        // Notification already created by trigger, just update it
        await supabase
          .from("admin_notifications")
          .insert({
            booking_id: booking.id,
            type: "PAYMENT_RECEIVED",
            title: "💰 Payment Received",
            message: `Booking ${bookingRef} paid ${booking.total_amount.toLocaleString("id-ID")} via ${paymentType}`,
            read: false,
          });

        console.log("✅ Booking updated to PAID");
      }
    } else if (transactionStatus === "pending") {
      // Payment pending (e.g., bank transfer)
      console.log("⏳ Payment PENDING for booking:", bookingRef);
      
      await supabase
        .from("bookings")
        .update({ status: "PENDING" })
        .eq("id", booking.id);

    } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
      // Payment failed/cancelled
      console.log("❌ Payment FAILED/CANCELLED for booking:", bookingRef);

      // Update booking to CANCELLED
      await supabase
        .from("bookings")
        .update({ status: "CANCELLED" })
        .eq("id", booking.id);

      // Release time slot
      await supabase
        .from("time_slots")
        .update({ available: true })
        .eq("id", booking.time_slot_id);

      // Notify admin
      await supabase
        .from("admin_notifications")
        .insert({
          booking_id: booking.id,
          type: "PAYMENT_FAILED",
          title: "❌ Payment Failed",
          message: `Booking ${bookingRef} payment ${transactionStatus}. Slot released.`,
          read: false,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
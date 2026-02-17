import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  cancelIpLimiter,
  getClientIp,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // RATE LIMITING
    const clientIp = getClientIp(request);
    const { success, reset, remaining } = await cancelIpLimiter.limit(clientIp);

    if (!success) {
      const error = createRateLimitResponse(
        false,
        reset,
        remaining,
        "cancellation",
      );
      console.log(`🚫 Cancel rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(error, {
        status: 429,
        headers: {
          "Retry-After": error!.retryAfter.toString(),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }

    const body = await request.json();
    const { bookingRef, statusCode, reason } = body;

    if (!bookingRef) {
      return NextResponse.json(
        { error: "bookingRef is required" },
        { status: 400 },
      );
    }

    if (bookingRef && !bookingRef.match(/^BAP\d+$/)) {
      return NextResponse.json(
        { error: "Invalid booking reference format" },
        { status: 400 },
      );
    }

    console.log(`Processing failed payment cancellation for: ${bookingRef}`);
    console.log(`Status Code: ${statusCode}, Reason: ${reason}`);

    const supabase = createServerClient();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_ref", bookingRef)
      .single();

    if (bookingError || !booking) {
      console.error("❌ Booking not found:", bookingRef);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if already processed
    const { canTransitionBookingStatus } =
      await import("@/lib/booking-state-machine");

    if (!canTransitionBookingStatus(booking.status, "CANCELLED")) {
      console.log(`⚠️ Cannot cancel booking in ${booking.status} state`);
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel a booking with status: ${booking.status}`,
        },
        { status: 400 },
      );
    }

    // Update booking to CANCELLED (both status and session_status)
    const { error: updateBookingError } = await supabase
      .from("bookings")
      .update({
        status: "CANCELLED",
        session_status: "CANCELLED", // ← ADD THIS LINE
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updateBookingError) {
      console.error("❌ Error updating booking:", updateBookingError);
      throw new Error("Failed to cancel booking");
    }

    console.log("✅ Booking status updated to CANCELLED");

    // Release ALL time slots
    const { data: relatedSlots } = await supabase
      .from("booking_time_slots")
      .select("time_slot_id")
      .eq("booking_id", booking.id);

    if (relatedSlots && relatedSlots.length > 0) {
      const slotIds = relatedSlots.map((r) => r.time_slot_id);

      const { error: releaseSlotError } = await supabase
        .from("time_slots")
        .update({ available: true })
        .in("id", slotIds);

      if (releaseSlotError) {
        console.error("❌ Error releasing time slots:", releaseSlotError);
      } else {
        console.log(`✅ Released ${slotIds.length} time slot(s)`);
      }
    }

    // Update payment record if exists
    const orderId = `BOOKING-${bookingRef}`;
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        status: "FAILED",
        updated_at: new Date().toISOString(),
      })
      .eq("midtrans_order_id", orderId);

    if (updatePaymentError) {
      console.log(
        "⚠️ No payment record found or error updating:",
        updatePaymentError.message,
      );
      // This is okay - payment might not have been created yet
    } else {
      console.log("✅ Payment record updated to FAILED");
    }

    // Create admin notification
    const notificationMessage = statusCode
      ? `Booking ${bookingRef} payment failed (Error ${statusCode}). ${
          reason || "Payment page error"
        }. Slot released.`
      : `Booking ${bookingRef} payment failed. ${
          reason || "User cancelled or payment page error"
        }. Slot released.`;

    const { error: notificationError } = await supabase
      .from("admin_notifications")
      .insert({
        booking_id: booking.id,
        type: "PAYMENT_FAILED",
        title: "❌ Payment Failed",
        message: notificationMessage,
        read: false,
      });

    if (notificationError) {
      console.error("⚠️ Error creating notification:", notificationError);
      // Continue anyway - main operation succeeded
    } else {
      console.log("✅ Admin notification created");
    }

    console.log(`✅ Failed payment fully processed for ${bookingRef}`);

    return NextResponse.json({
      success: true,
      message: "Booking cancelled and slot released successfully",
      bookingRef,
      status: "CANCELLED",
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Error in cancel-failed:", err);
    return NextResponse.json(
      {
        error: "Failed to process cancellation",
        details: err.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

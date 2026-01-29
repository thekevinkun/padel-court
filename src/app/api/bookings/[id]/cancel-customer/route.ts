import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Endpoint to handle customer-initiated booking cancellations
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Extract booking ID and cancellation reason
    const { id: bookingId } = await params;
    const body = await request.json();
    const { reason, email, bookingRef } = body;

    // Validate required fields
    if (!email || !bookingRef) {
      return NextResponse.json(
        { error: "Email and booking reference required" },
        { status: 400 },
      );
    }

    console.log("Customer cancellation request:", bookingId, email, bookingRef);

    // Initialize Supabase client
    const supabase = createServerClient();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, courts(name)")
      .eq("id", bookingId)
      .eq("customer_email", email.toLowerCase().trim()) // Security: must match email
      .eq("booking_ref", bookingRef.toUpperCase().trim()) // Security: must match ref
      .single();

    console.log("Fetched booking for cancellation:", booking);

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found: ", bookingError },
        { status: 404 },
      );
    }

    // Validation checks
    // If it's already cancelled or refunded, then it's already cancelled
    if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 },
      );
    }

    // If it's not paid yet, can't be cancelled
    if (booking.status !== "PAID") {
      return NextResponse.json(
        { error: "Only paid bookings can be cancelled" },
        { status: 400 },
      );
    }

    // If session is in progress or completed, can't be cancelled
    if (
      booking.session_status === "IN_PROGRESS" ||
      booking.session_status === "COMPLETED"
    ) {
      return NextResponse.json(
        { error: "Cannot cancel an active or completed session" },
        { status: 400 },
      );
    }

    // Calculate hours until SESSION STARTS (not booking time!)
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.time
      .split(" - ")[0]
      .split(":")
      .map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const hoursUntilSession = Math.round(
      (bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60),
    );

    console.log(`⏰ Session starts in ${hoursUntilSession} hours`);

    // Fetch refund policy from settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select(
        "refund_full_hours, refund_partial_hours, refund_partial_percentage",
      )
      .single();

    // Refund policy (with fallback defaults)
    const REFUND_FULL_HOURS = settingsData?.refund_full_hours ?? 24;
    const REFUND_PARTIAL_HOURS = settingsData?.refund_partial_hours ?? 12;
    const REFUND_PARTIAL_PERCENTAGE =
      settingsData?.refund_partial_percentage ?? 50;

    console.log(
      `📋 Refund policy: Full=${REFUND_FULL_HOURS}hrs, Partial=${REFUND_PARTIAL_HOURS}hrs (${REFUND_PARTIAL_PERCENTAGE}%)`,
    );

    let refundAmount = 0;
    let refundType = "NONE";

    if (hoursUntilSession >= REFUND_FULL_HOURS) {
      // Full refund: ≥24 hours before session
      refundAmount = booking.total_amount;
      refundType = "FULL";
    } else if (hoursUntilSession >= REFUND_PARTIAL_HOURS) {
      // Partial refund: 12-24 hours before session
      refundAmount = Math.round(
        booking.total_amount * (REFUND_PARTIAL_PERCENTAGE / 100),
      );
      refundType = "PARTIAL";
    } else {
      // No refund: <12 hours before session
      refundAmount = 0;
      refundType = "NONE";
    }

    console.log(
      `💰 Refund type: ${refundType}, Amount: IDR ${refundAmount.toLocaleString("id-ID")}`,
    );

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: refundAmount > 0 ? "REFUNDED" : "CANCELLED",
        session_status: "CANCELLED",
        refund_status: refundAmount > 0 ? "COMPLETED" : null,
        refund_amount: refundAmount,
        refund_date: refundAmount > 0 ? new Date().toISOString() : null,
        refund_reason: reason || "Customer cancellation",
        refund_method: refundAmount > 0 ? "MIDTRANS" : null,
        refund_notes: `${refundType} refund: Cancelled ${hoursUntilSession} hours before session (Policy: ≥24hrs=full, 12-24hrs=50%, <12hrs=none)`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel booking" },
        { status: 500 },
      );
    }

    // Release ALL time slots
    const { data: relatedSlots } = await supabase
      .from("booking_time_slots")
      .select("time_slot_id")
      .eq("booking_id", bookingId);

    if (relatedSlots && relatedSlots.length > 0) {
      const slotIds = relatedSlots.map((r) => r.time_slot_id);
      await supabase
        .from("time_slots")
        .update({ available: true })
        .in("id", slotIds);

      console.log(`✅ Released ${slotIds.length} time slot(s)`);
    }

    // Create admin notification
    const notificationTitle =
      refundType === "FULL"
        ? "💲 Customer Cancellation (Full Refund)"
        : refundType === "PARTIAL"
          ? "⚖️ Customer Cancellation (Partial Refund)"
          : "🚫 Customer Cancellation (No Refund)";

    const notificationMessage =
      refundType === "FULL"
        ? `${booking.customer_name} cancelled ${booking.booking_ref}. Full refund: IDR ${refundAmount.toLocaleString("id-ID")} (cancelled ${hoursUntilSession}hrs before session)`
        : refundType === "PARTIAL"
          ? `${booking.customer_name} cancelled ${booking.booking_ref}. Partial refund (50%): IDR ${refundAmount.toLocaleString("id-ID")} (cancelled ${hoursUntilSession}hrs before session)`
          : `${booking.customer_name} cancelled ${booking.booking_ref}. No refund (cancelled ${hoursUntilSession}hrs before session - less than 12hrs)`;

    await supabase.from("admin_notifications").insert({
      booking_id: bookingId,
      type: "CANCELLATION",
      title: notificationTitle,
      message: notificationMessage,
      read: false,
    });

    // Send cancellation email
    try {
      const { sendCancellationConfirmation } = await import("@/lib/email");
      await sendCancellationConfirmation({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        bookingRef: booking.booking_ref,
        courtName: booking.courts.name,
        date: new Date(booking.date).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: booking.time,
        originalAmount: booking.subtotal,
        refundAmount: refundAmount,
        refundEligible: refundAmount > 0,
        cancellationReason: reason || "Customer request",
        hoursBeforeBooking: hoursUntilSession, // Changed from hoursUntilBooking
      });

      console.log("✅ Cancellation email sent");
    } catch (emailError) {
      console.error("❌ Failed to send cancellation email:", emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      refundType: refundType,
      refundAmount: refundAmount,
      hoursUntilSession: hoursUntilSession,
      message:
        refundType === "FULL"
          ? `Booking cancelled. Full refund of IDR ${refundAmount.toLocaleString("id-ID")} will be processed (cancelled ${hoursUntilSession} hours before session).`
          : refundType === "PARTIAL"
            ? `Booking cancelled. Partial refund of IDR ${refundAmount.toLocaleString("id-ID")} (50%) will be processed (cancelled ${hoursUntilSession} hours before session).`
            : `Booking cancelled. No refund available (cancelled ${hoursUntilSession} hours before session - less than 12 hours).`,
    });
  } catch (error) {
    console.error("💥 Error in customer cancellation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

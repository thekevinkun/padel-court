import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const { reason } = body;

    console.log("🚫 Customer cancellation request:", bookingId);

    const supabase = createServerClient();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, courts(name), time_slots(id)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Validation checks
    if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 },
      );
    }

    if (booking.status !== "PAID") {
      return NextResponse.json(
        { error: "Only paid bookings can be cancelled" },
        { status: 400 },
      );
    }

    if (
      booking.session_status === "IN_PROGRESS" ||
      booking.session_status === "COMPLETED"
    ) {
      return NextResponse.json(
        { error: "Cannot cancel an active or completed session" },
        { status: 400 },
      );
    }

    // Calculate hours until booking
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.time
      .split(" - ")[0]
      .split(":")
      .map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const hoursUntilBooking =
      Math.round((bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60));

    console.log(`⏰ Booking is in ${hoursUntilBooking} hours`);

    // Determine refund eligibility (> 24 hours = full refund)
    const isRefundEligible = hoursUntilBooking > 24;
    const refundAmount = isRefundEligible ? booking.total_amount : 0;

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: isRefundEligible ? "REFUNDED" : "CANCELLED",
        session_status: "CANCELLED",
        refund_status: isRefundEligible ? "COMPLETED" : null,
        refund_amount: refundAmount,
        refund_date: isRefundEligible ? new Date().toISOString() : null,
        refund_reason: reason || "Customer cancellation",
        refund_method: isRefundEligible ? "MIDTRANS" : null,
        refund_notes: isRefundEligible
          ? `Auto-refund: Cancelled ${hoursUntilBooking} hours before booking`
          : `Cancelled ${hoursUntilBooking} hours before booking - no refund (< 24hrs policy)`,
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

    // Release time slot
    if (booking.time_slots?.id) {
      await supabase
        .from("time_slots")
        .update({ available: true })
        .eq("id", booking.time_slots.id);

      console.log("✅ Time slot released");
    }

    // Create admin notification
    await supabase.from("admin_notifications").insert({
      booking_id: bookingId,
      type: "CANCELLATION",
      title: isRefundEligible
        ? "💲 Customer Cancellation (Refunded)"
        : "🚫 Customer Cancellation (No Refund)",
      message: `${booking.customer_name} cancelled booking ${booking.booking_ref}. ${
        isRefundEligible
          ? `Full refund: IDR ${refundAmount.toLocaleString("id-ID")}`
          : "No refund (cancelled < 24hrs before booking)"
      }`,
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
        refundEligible: isRefundEligible,
        cancellationReason: reason || "Customer request",
        hoursBeforeBooking: hoursUntilBooking,
      });

      console.log("✅ Cancellation email sent");
    } catch (emailError) {
      console.error("❌ Failed to send cancellation email:", emailError);
      // Don't fail the cancellation if email fails
    }

    console.log(
      `✅ Booking cancelled: ${booking.booking_ref} (Refund: ${isRefundEligible ? "YES" : "NO"})`,
    );

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      refundEligible: isRefundEligible,
      refundAmount: refundAmount,
      message: isRefundEligible
        ? `Booking cancelled. Full refund of IDR ${refundAmount.toLocaleString("id-ID")} will be processed.`
        : "Booking cancelled. No refund available (cancelled less than 24 hours before booking).",
    });
  } catch (error) {
    console.error("💥 Error in customer cancellation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

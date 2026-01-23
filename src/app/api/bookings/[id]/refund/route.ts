import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";

// Endpoint to process a refund for a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Extract booking ID and refund details from request
    const { id: bookingId } = await params;
    const body = await request.json();
    const { refundAmount, refundMethod, reason, notes } = body;

    console.log("Processing refund for booking:", bookingId);

    // Initialize Supabase only for Authenticate admin
    const authSupabase = await createAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize Supabase client
    const supabase = createServerClient();

    // Verify admin role
    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!adminRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
          *,
          courts (name, description)
        `,
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Validation checks
    // If it's not paid yet, nothing to refund
    if (booking.status !== "PAID") {
      return NextResponse.json(
        { error: "Can only refund paid bookings" },
        { status: 400 },
      );
    }

    // If it's already refunded, nothing to refund more
    if (booking.refund_status === "COMPLETED") {
      return NextResponse.json(
        { error: "Booking already refunded" },
        { status: 409 },
      );
    }

    // Validate refund amount
    const maxRefundAmount = booking.total_amount;

    // Check refund amount boundaries
    if (refundAmount > maxRefundAmount) {
      return NextResponse.json(
        {
          error: `Refund amount cannot exceed IDR ${maxRefundAmount.toLocaleString(
            "id-ID",
          )}`,
        },
        { status: 400 },
      );
    }

    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: "Refund amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Process refund
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "REFUNDED", // CHANGE status to REFUNDED
        refund_status: "COMPLETED",
        refund_amount: refundAmount,
        refund_date: new Date().toISOString(),
        refund_reason: reason || "Cancellation",
        refund_method: refundMethod,
        refunded_by: user.id,
        refund_notes: notes,
        session_status: "CANCELLED", // Mark session as cancelled
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error processing refund:", updateError);
      return NextResponse.json(
        { error: "Failed to process refund" },
        { status: 500 },
      );
    }

    // Release time slot
    if (booking.time_slot_id) {
      await supabase
        .from("time_slots")
        .update({ available: true })
        .eq("id", booking.time_slot_id);
    }

    // Create admin notification
    await supabase.from("admin_notifications").insert({
      booking_id: bookingId,
      type: "REFUND_PROCESSED",
      title: "💲 Refund Processed",
      message: `Refund of IDR ${refundAmount.toLocaleString(
        "id-ID",
      )} processed for booking ${
        booking.booking_ref
      }. Customer: ${booking.customer_name}. Method: ${refundMethod}.`,
      read: false,
    });

    // Send refund confirmation email
    try {
      const { sendRefundConfirmation } = await import("@/lib/email");
      await sendRefundConfirmation({
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
        originalAmount: booking.subtotal,
        refundAmount: refundAmount,
        refundMethod: refundMethod,
        refundReason: reason || "Cancellation",
      });
      console.log("✅ Refund confirmation email sent");
    } catch (emailError) {
      console.error("❌ Failed to send refund email:", emailError);
      // Don't fail the refund if email fails
    }

    console.log(
      `✅ Refund processed: ${booking.booking_ref} - IDR ${refundAmount.toLocaleString(
        "id-ID",
      )}`,
    );

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Refund processed successfully",
    });
  } catch (error) {
    console.error("💥 Unexpected error in refund:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

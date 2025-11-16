import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const body = await request.json();
    const { reason } = body;

    console.log("❌ Cancelling booking:", bookingId);

    // Authenticate admin
    const authSupabase = await createAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      .select("*, time_slots(id)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Validate can be cancelled
    if (booking.session_status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot cancel a completed session" },
        { status: 400 }
      );
    }

    if (booking.session_status === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 409 }
      );
    }

    // Cancel booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        session_status: "CANCELLED",
        status: booking.status === "PAID" ? "PAID" : "CANCELLED", // Keep payment status as PAID if already paid
        session_notes: reason || booking.session_notes,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error cancelling booking:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel booking" },
        { status: 500 }
      );
    }

    // Release time slot
    if (booking.time_slots?.id) {
      await supabase
        .from("time_slots")
        .update({ available: true })
        .eq("id", booking.time_slots.id);
    }

    // Create notification
    await supabase.from("admin_notifications").insert({
      booking_id: bookingId,
      type: "CANCELLATION",
      title: "🚫 Booking Cancelled",
      message: `Booking ${booking.booking_ref} cancelled by admin. Reason: ${
        reason || "No reason provided"
      }`,
      read: false,
    });

    console.log(`✅ Booking cancelled: ${booking.booking_ref}`);

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("💥 Unexpected error in cancel booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

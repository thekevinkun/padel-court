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
    const { notes } = body; // Optional notes from admin

    console.log("Checking out booking:", bookingId);

    // 1Authenticate admin
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
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Validate booking can be checked out
    if (booking.session_status === "COMPLETED") {
      return NextResponse.json(
        { error: "Booking already checked out" },
        { status: 409 }
      );
    }

    if (booking.session_status === "UPCOMING") {
      return NextResponse.json(
        { error: "Cannot check out a booking that hasn't been checked in" },
        { status: 400 }
      );
    }

    // Update booking to COMPLETED
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        session_status: "COMPLETED",
        checked_out_at: new Date().toISOString(),
        session_notes: notes || booking.session_notes,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error checking out:", updateError);
      return NextResponse.json(
        { error: "Failed to check out" },
        { status: 500 }
      );
    }

    // Create notification
    await supabase.from("admin_notifications").insert({
      booking_id: bookingId,
      type: "SESSION_COMPLETED",
      title: "Customer Checked Out",
      message: `Booking ${booking.booking_ref} - ${booking.customer_name} completed session`,
      read: false,
    });

    console.log(`Check-out successful: ${booking.booking_ref}`);

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Customer checked out successfully",
    });
  } catch (error) {
    console.error("Unexpected error in check-out:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

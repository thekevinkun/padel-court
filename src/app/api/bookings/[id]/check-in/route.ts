import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";

// Endpoint to handle admin-initiated booking check-ins
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract booking ID and optional notes from admin
    const { id: bookingId } = await params;
    const body = await request.json();
    const { notes } = body;

    console.log("Checking in booking:", bookingId);

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
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Validation checks
    // If it's not paid yet, can't checked in
    if (booking.status !== "PAID") {
      return NextResponse.json(
        { error: "Booking must be paid before check-in" },
        { status: 400 }
      );
    }

    // If session is in progress, already checked in
    if (booking.session_status === "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Booking already checked in" },
        { status: 409 }
      );
    }

    // If session is completed, already checked in
    if (booking.session_status === "COMPLETED") {
      return NextResponse.json(
        { error: "Booking session already completed" },
        { status: 410 }
      );
    }

    // Check venue payment for deposit bookings
    if (booking.require_deposit && !booking.venue_payment_received) {
      // Check if venue payment has expired
      if (booking.venue_payment_expired) {
        return NextResponse.json(
          {
            error: "Venue payment window has expired. Cannot check in.",
            code: "VENUE_PAYMENT_EXPIRED",
          },
          { status: 410 }
        );
      }

      // Venue payment still pending
      return NextResponse.json(
        {
          error: `Customer must pay remaining balance of IDR ${booking.remaining_balance.toLocaleString(
            "id-ID"
          )} before check-in.`,
          code: "VENUE_PAYMENT_REQUIRED",
          remainingBalance: booking.remaining_balance,
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // Update booking to IN_PROGRESS
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        session_status: "IN_PROGRESS",
        checked_in_at: new Date().toISOString(),
        session_notes: notes || booking.session_notes,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error checking in:", updateError);
      return NextResponse.json(
        { error: "Failed to check in" },
        { status: 500 }
      );
    }

    // Create notification
    await supabase.from("admin_notifications").insert({
      booking_id: bookingId,
      type: "SESSION_STARTED",
      title: "Customer Checked In",
      message: `Booking ${booking.booking_ref} - ${booking.customer_name} checked in for ${booking.time}`,
      read: false,
    });

    console.log(`Check-in successful: ${booking.booking_ref}`);

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Customer checked in successfully",
    });
  } catch (error) {
    console.error("Unexpected error in check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

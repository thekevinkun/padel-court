import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const { amount, paymentMethod, notes } = body;

    console.log("Recording venue payment for booking:", bookingId);

    // Authenticate admin
    const authSupabase = await createAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication failed:", authError);
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
      console.error("User is not admin:", user.id);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, courts(name)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found:", bookingId);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 4. Check if booking time has passed (NEW CHECK)
    const bookingDate = new Date(booking.date);
    const timeEnd = booking.time.split(" - ")[1]; // "09:00 - 10:00" -> "10:00"
    const [hours, minutes] = timeEnd.split(":").map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const hasTimePassed = now > bookingDate;

    if (hasTimePassed) {
      // Mark as expired if not already
      await supabase
        .from("bookings")
        .update({ venue_payment_expired: true })
        .eq("id", bookingId);

      return NextResponse.json(
        {
          error: "Booking time has passed. Venue payment window expired.",
          expired: true,
        },
        { status: 410 } // 410 Gone
      );
    }

    // Validate payment amount
    if (amount !== booking.remaining_balance) {
      return NextResponse.json(
        {
          error: `Amount must be exactly IDR ${booking.remaining_balance.toLocaleString(
            "id-ID"
          )}`,
        },
        { status: 400 }
      );
    }

    // Check if already paid
    if (booking.venue_payment_received) {
      return NextResponse.json(
        { error: "Venue payment already recorded for this booking" },
        { status: 409 }
      );
    }

    // 6. Record venue payment
    const { data: venuePayment, error: paymentError } = await supabase
      .from("venue_payments")
      .insert({
        booking_id: bookingId,
        amount: amount,
        payment_method: paymentMethod,
        notes: notes || null,
        received_by: user.id,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error recording venue payment:", paymentError);
      return NextResponse.json(
        { error: "Failed to record payment" },
        { status: 500 }
      );
    }

    // Update booking record
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        venue_payment_received: true,
        venue_payment_amount: amount,
        venue_payment_date: new Date().toISOString(),
        venue_payment_method: paymentMethod,
        remaining_balance: 0,
        venue_payment_expired: false, // Reset expired flag
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      // Rollback: delete venue payment
      await supabase.from("venue_payments").delete().eq("id", venuePayment.id);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    // Create admin notification
    await supabase.from("admin_notifications").insert({
      booking_id: bookingId,
      type: "PAYMENT_RECEIVED",
      title: "Venue Payment Received",
      message: `Booking ${
        booking.booking_ref
      } - Received IDR ${amount.toLocaleString(
        "id-ID"
      )} via ${paymentMethod} at venue by ${booking.customer_name}`,
      read: false,
    });

    console.log(
      `Venue payment recorded: ${
        booking.booking_ref
      } - IDR ${amount.toLocaleString("id-ID")}`
    );

    return NextResponse.json({
      success: true,
      payment: venuePayment,
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("Unexpected error in venue payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

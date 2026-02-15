import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        courts (name)
      `,
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify venue payment was received
    if (!booking.venue_payment_received) {
      return NextResponse.json(
        { error: "Venue payment has not been received yet" },
        { status: 400 },
      );
    }

    // Send confirmation email
    const { sendVenuePaymentConfirmation } = await import("@/lib/email");

    const result = await sendVenuePaymentConfirmation({
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      bookingRef: booking.booking_ref,
      courtName: booking.courts?.name || "Padel Court",
      date: new Date(booking.date).toLocaleDateString("en-ID", {
        timeZone: "Asia/Makassar",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: booking.time,
      venuePaymentAmount: booking.venue_payment_amount,
      paymentMethod: booking.venue_payment_method,
      depositAmount: booking.deposit_amount,
      totalAmount: booking.subtotal,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Venue payment confirmation email resent successfully",
    });
  } catch (error) {
    console.error("Error in resend venue payment email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        courts (name)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is already paid
    if (booking.status === "PAID") {
      return NextResponse.json(
        { error: "Booking already paid" },
        { status: 400 }
      );
    }

    // Initialize Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    // Generate unique order ID
    const orderId = `BOOKING-${booking.booking_ref}`;

    // Create transaction parameters
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.total_amount,
      },
      customer_details: {
        first_name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone,
      },
      item_details: [
        {
          id: "court-booking",
          price: booking.subtotal,
          quantity: 1,
          name: `${booking.courts.name} - ${booking.time}`,
        },
        ...(booking.payment_fee > 0 ? [{
          id: "payment-fee",
          price: booking.payment_fee,
          quantity: 1,
          name: "Payment Processing Fee",
        }] : []),
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success/${booking.booking_ref}`,
        error: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/failed`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/pending/${booking.booking_ref}`,
      },
    };

    // Create transaction with Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Store payment record in database
    await supabase.from("payments").insert({
      booking_id: bookingId,
      midtrans_order_id: orderId,
      amount: booking.total_amount,
      status: "PENDING",
      payment_response: transaction,
    });

    return NextResponse.json({
      success: true,
      paymentUrl: transaction.redirect_url,
      token: transaction.token,
      orderId: orderId,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment", details: error },
      { status: 500 }
    );
  }
}
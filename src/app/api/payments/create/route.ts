import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  paymentIpLimiter,
  getClientIp,
  createRateLimitResponse,
} from "@/lib/rate-limit";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    // RATE LIMITING - Prevent payment fraud
    const clientIp = getClientIp(request);
    const { success, reset, remaining } =
      await paymentIpLimiter.limit(clientIp);

    if (!success) {
      const error = createRateLimitResponse(false, reset, remaining, "payment");
      console.log(`🚫 Payment rate limit exceeded for IP: ${clientIp}`);
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
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Get booking details
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

    // Check if booking is already paid
    if (booking.status === "PAID") {
      return NextResponse.json(
        { error: "Booking already paid" },
        { status: 400 },
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

    // Adjust item_details to match total_amount
    // If total_amount is less than subtotal, it's a deposit payment
    const isDepositPayment = booking.total_amount < booking.subtotal;

    let itemDetails;
    if (isDepositPayment) {
      // For deposit: Create item that matches deposit amount
      itemDetails = [
        {
          id: "court-booking-deposit",
          price: booking.total_amount, // Use deposit amount
          quantity: 1,
          name: `${booking.courts.name} - ${booking.time} (Deposit)`,
        },
      ];
    } else {
      // For full payment: Use subtotal + fees as before
      itemDetails = [
        {
          id: "court-booking",
          price: booking.subtotal,
          quantity: 1,
          name: `${booking.courts.name} - ${booking.time}`,
        },
        ...(booking.payment_fee > 0
          ? [
              {
                id: "payment-fee",
                price: booking.payment_fee,
                quantity: 1,
                name: "Payment Processing Fee",
              },
            ]
          : []),
      ];
    }

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
      item_details: itemDetails, // Use conditional items
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success/${booking.booking_ref}`,
        error: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/failed`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/pending/${booking.booking_ref}`,
      },
    };

    console.log("💳 Creating Midtrans transaction:", {
      orderId,
      gross_amount: booking.total_amount,
      isDeposit: isDepositPayment,
      items: itemDetails,
    });

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

    // Store payment URL in booking record
    await supabase
      .from("bookings")
      .update({
        payment_url: transaction.redirect_url,
        payment_token: transaction.token,
        payment_created_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    console.log(`💳 Payment URL stored for booking ${bookingId}`);

    // Send payment required email
    try {
      const { sendPaymentRequired } = await import("@/lib/email");

      await sendPaymentRequired({
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
        numberOfPlayers: booking.number_of_players,
        totalAmount: booking.total_amount,
        requireDeposit: booking.require_deposit,
        depositAmount: booking.deposit_amount,
        remainingBalance: booking.remaining_balance,
        paymentMethod: "Online Payment",
        paymentUrl: transaction.redirect_url,
        equipmentRentals: booking.booking_equipment?.map((item: any) => ({
          name: item.equipment?.name || "Equipment",
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        additionalPlayers: booking.booking_players
          ?.filter((p: any) => !p.is_primary_booker)
          .map((p: any) => ({
            name: p.player_name,
            email: p.player_email,
            whatsapp: p.player_whatsapp,
          })),
      });

      console.log("✅ Payment required email sent");
    } catch (emailError) {
      console.error("❌ Failed to send payment email:", emailError);
      // Don't fail the payment creation if email fails
    }

    return NextResponse.json({
      success: true,
      paymentUrl: transaction.redirect_url,
      token: transaction.token,
      orderId: orderId,
    });
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      ApiResponse?: unknown;
      httpStatusCode?: number;
    };
    const errorMessage = err.message || "Failed to create payment";
    const errorDetails =
      err.ApiResponse || err.httpStatusCode || "Unknown error";

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          typeof errorDetails === "object"
            ? JSON.stringify(errorDetails)
            : errorDetails,
      },
      { status: 500 },
    );
  }
}

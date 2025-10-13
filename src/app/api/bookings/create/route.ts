import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      courtId,
      timeSlotId,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsapp,
      numberOfPlayers,
      subtotal,
      paymentFee,
      totalAmount,
      paymentMethod,
      notes,
    } = body;

    // Validate required fields
    if (!courtId || !timeSlotId || !date || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if time slot is still available
    const { data: slot, error: slotError } = await supabase
      .from("time_slots")
      .select("available")
      .eq("id", timeSlotId)
      .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    if (!slot.available) {
      return NextResponse.json(
        { error: "Time slot is no longer available" },
        { status: 409 }
      );
    }

    // Generate unique booking reference
    const bookingRef = `BAP${Date.now().toString().slice(-8)}`;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        booking_ref: bookingRef,
        court_id: courtId,
        time_slot_id: timeSlotId,
        date,
        time,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_whatsapp: customerWhatsapp,
        number_of_players: numberOfPlayers,
        subtotal,
        payment_fee: paymentFee || 0,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        notes: notes || null,
        status: "PENDING", // Payment not done yet
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // Temporarily lock the time slot (will be confirmed when payment succeeds)
    await supabase
      .from("time_slots")
      .update({ available: false })
      .eq("id", timeSlotId);

    // Create admin notification
    await supabase
      .from("admin_notifications")
      .insert({
        booking_id: booking.id,
        type: "NEW_BOOKING",
        title: "New Booking Created",
        message: `Booking ${bookingRef} created. Customer: ${customerName}. Waiting for payment.`,
        read: false,
      });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingRef: booking.booking_ref,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
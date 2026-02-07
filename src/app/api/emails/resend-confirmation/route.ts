import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { BookingEquipment, BookingPlayer } from "@/types/booking";

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

    // Get booking with all relations
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        courts (name, description),
        booking_equipment (
          id,
          equipment_id,
          quantity,
          price_per_unit,
          subtotal,
          equipment (id, name, category, description)
        ),
        booking_players (
          id,
          player_order,
          player_name,
          player_email,
          player_whatsapp,
          is_primary_booker
        )
      `,
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only resend for paid bookings
    if (booking.status !== "PAID") {
      return NextResponse.json(
        { error: "Can only resend confirmation for paid bookings" },
        { status: 400 },
      );
    }

    // Send confirmation email
    const { sendBookingConfirmation } = await import("@/lib/email");

    const equipmentRentals =
      booking.booking_equipment?.map((item: BookingEquipment) => ({
        name: item.equipment?.name || "Unknown Equipment",
        quantity: item.quantity,
        subtotal: item.subtotal,
      })) || [];

    const additionalPlayers =
      booking.booking_players
        ?.filter((p: BookingPlayer) => !p.is_primary_booker)
        .map((p: BookingPlayer) => ({
          name: p.player_name,
          email: p.player_email,
          whatsapp: p.player_whatsapp,
        })) || [];

    await sendBookingConfirmation({
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
      numberOfPlayers: booking.number_of_players,
      totalAmount: booking.total_amount,
      requireDeposit: booking.require_deposit,
      depositAmount: booking.deposit_amount,
      remainingBalance: booking.remaining_balance,
      paymentMethod: booking.payment_method || "Online Payment",
      equipmentRentals:
        equipmentRentals && equipmentRentals.length > 0
          ? equipmentRentals
          : undefined,
      additionalPlayers:
        additionalPlayers && additionalPlayers.length > 0
          ? additionalPlayers
          : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Confirmation email resent successfully",
    });
  } catch (error) {
    console.error("Error resending confirmation:", error);
    return NextResponse.json(
      { error: "Failed to resend confirmation email" },
      { status: 500 },
    );
  }
}

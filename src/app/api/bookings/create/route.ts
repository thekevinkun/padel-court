import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  bookingIpLimiter,
  bookingEmailLimiter,
  getClientIp,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // RATE LIMITING - Check IP-based limit
    const clientIp = getClientIp(request);
    const {
      success: ipSuccess,
      reset: ipReset,
      remaining: ipRemaining,
    } = await bookingIpLimiter.limit(clientIp);

    if (!ipSuccess) {
      // Exceeded IP rate limit
      const error = createRateLimitResponse(
        false,
        ipReset,
        ipRemaining,
        "booking",
      );
      console.log(`🚫 Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(error, {
        status: 429,
        headers: {
          "Retry-After": error!.retryAfter.toString(),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": ipRemaining.toString(),
          "X-RateLimit-Reset": ipReset.toString(),
        },
      });
    }

    // Parse request body
    const body = await request.json();

    // Extract fields from body
    const {
      courtId,
      timeSlotIds, // Array of selected time slots
      date,
      time,
      timeStart,
      timeEnd,
      durationHours,
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
      requireDeposit,
      depositAmount,
      fullAmount,
      paymentChoice,
      equipmentRentals, // Array of equipment rentals
      additionalPlayers, // Array of guest players
    } = body;

    // RATE LIMITING - Check email-based rate limit
    const emailKey = customerEmail.toLowerCase().trim();
    const {
      success: emailSuccess,
      reset: emailReset,
      remaining: emailRemaining,
    } = await bookingEmailLimiter.limit(emailKey);

    if (!emailSuccess) {
      // Exceeded email rate limit
      const error = createRateLimitResponse(
        false,
        emailReset,
        emailRemaining,
        "booking for this email",
      );
      console.log(`🚫 Rate limit exceeded for email: ${customerEmail}`);
      return NextResponse.json(error, {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": emailRemaining.toString(),
          "X-RateLimit-Reset": emailReset.toString(),
        },
      });
    }

    // Validate required fields
    if (
      !courtId ||
      !timeSlotIds ||
      !Array.isArray(timeSlotIds) ||
      timeSlotIds.length === 0 || // CHANGED: Validate array
      !date ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Initialize Supabase client
    const supabase = createServerClient();

    // Check if ALL selected slots are available
    const { data: slots, error: slotError } = await supabase
      .from("time_slots")
      .select("id, available, time_start")
      .in("id", timeSlotIds)
      .eq("court_id", courtId)
      .eq("date", date);

    if (slotError || !slots || slots.length !== timeSlotIds.length) {
      return NextResponse.json(
        { error: "One or more time slots not found" },
        { status: 404 },
      );
    }

    // Check if any slot is unavailable
    const unavailableSlots = slots.filter((s) => !s.available);
    if (unavailableSlots.length > 0) {
      return NextResponse.json(
        { error: "One or more selected time slots are no longer available" },
        { status: 409 },
      );
    }

    // Verify slots are contiguous
    const sortedSlots = slots.sort((a, b) =>
      a.time_start.localeCompare(b.time_start),
    );

    // Loop through sorted slots to ensure each starts when the previous ends
    for (let i = 1; i < sortedSlots.length; i++) {
      // Compare end of previous slot to start of current slot
      const prevEnd = sortedSlots[i - 1].time_start.slice(0, 2);
      const currentStart = sortedSlots[i].time_start.slice(0, 2);
      const hourDiff = parseInt(currentStart) - parseInt(prevEnd);

      // If difference is not 1 hour, slots are not contiguous
      if (hourDiff !== 1) {
        return NextResponse.json(
          { error: "Selected time slots must be contiguous" },
          { status: 400 },
        );
      }
    }

    // Generate unique booking reference
    const bookingRef = `BAP${Date.now().toString().slice(-8)}`;

    // Determine actual payment structure based on choice
    let actualDepositAmount = 0;
    let actualRemainingBalance = 0;
    let actualRequireDeposit = false;
    let actualCustomerPaymentChoice = null;

    if (paymentChoice === "FULL") {
      // Customer chose full payment - no venue payment needed
      actualDepositAmount = 0;
      actualRemainingBalance = 0;
      actualRequireDeposit = false;
      actualCustomerPaymentChoice = "FULL";
    } else if (paymentChoice === "DEPOSIT" && requireDeposit) {
      // Customer chose deposit payment
      actualDepositAmount = depositAmount;
      actualRemainingBalance = (fullAmount || subtotal) - totalAmount;
      actualRequireDeposit = true;
      actualCustomerPaymentChoice = "DEPOSIT";
    } else {
      // No deposit option available - full payment only
      actualDepositAmount = 0;
      actualRemainingBalance = 0;
      actualRequireDeposit = false;
      actualCustomerPaymentChoice = "FULL";
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        booking_ref: bookingRef,
        court_id: courtId,
        date,
        time,
        time_start: timeStart, // NEW
        time_end: timeEnd, // NEW
        duration_hours: durationHours, // NEW
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
        status: "PENDING",
        require_deposit: actualRequireDeposit,
        deposit_amount: actualDepositAmount,
        full_amount: fullAmount || subtotal,
        remaining_balance: actualRemainingBalance,
        customer_payment_choice: actualCustomerPaymentChoice,
        session_status: "UPCOMING",
        venue_payment_expired: false,
        equipment_subtotal:
          equipmentRentals && equipmentRentals.length > 0
            ? equipmentRentals.reduce(
                (
                  sum: number,
                  item: { quantity: number; pricePerUnit: number },
                ) => sum + item.quantity * item.pricePerUnit,
                0,
              )
            : 0,
        has_equipment_rental: equipmentRentals && equipmentRentals.length > 0,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }

    // Create junction table entries
    const junctionEntries = timeSlotIds.map((slotId: string) => ({
      booking_id: booking.id,
      time_slot_id: slotId,
    }));

    const { error: junctionError } = await supabase
      .from("booking_time_slots")
      .insert(junctionEntries);

    if (junctionError) {
      console.error("Error creating booking-slot relations:", junctionError);
      // Rollback: delete the booking
      await supabase.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "Failed to create booking relations" },
        { status: 500 },
      );
    }

    // Lock ALL selected slots
    await supabase
      .from("time_slots")
      .update({ available: false })
      .in("id", timeSlotIds);

    // Create equipment rentals (if any)
    if (equipmentRentals && equipmentRentals.length > 0) {
      const equipmentEntries = equipmentRentals.map(
        (rental: {
          equipmentId: string;
          quantity: number;
          pricePerUnit: number;
        }) => ({
          booking_id: booking.id,
          equipment_id: rental.equipmentId,
          quantity: rental.quantity,
          price_per_unit: rental.pricePerUnit,
          subtotal: rental.quantity * rental.pricePerUnit,
        }),
      );

      const { error: equipmentError } = await supabase
        .from("booking_equipment")
        .insert(equipmentEntries);

      if (equipmentError) {
        console.error("Error creating equipment rentals:", equipmentError);
        // Rollback: delete the booking
        await supabase.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          { error: "Failed to create equipment rentals" },
          { status: 500 },
        );
      }
    }

    // Create player records (if any)
    const playerEntries = [
      // Primary booker (always exists)
      {
        booking_id: booking.id,
        player_order: 1,
        player_name: customerName,
        player_email: customerEmail,
        player_whatsapp: customerWhatsapp,
        is_primary_booker: true,
      },
    ];

    // Add additional players (if provided)
    if (additionalPlayers && additionalPlayers.length > 0) {
      additionalPlayers.forEach(
        (
          player: { name?: string; email?: string; whatsapp?: string },
          index: number,
        ) => {
          // Only add if at least name is provided
          if (player.name && player.name.trim()) {
            playerEntries.push({
              booking_id: booking.id,
              player_order: index + 2, // 2, 3, 4, etc.
              player_name: player.name.trim(),
              player_email: player.email?.trim() || null,
              player_whatsapp: player.whatsapp?.trim() || null,
              is_primary_booker: false,
            });
          }
        },
      );
    }

    const { error: playersError } = await supabase
      .from("booking_players")
      .insert(playerEntries);

    if (playersError) {
      console.error("Error creating player records:", playersError);
      // Rollback: delete the booking (cascades to equipment too)
      await supabase.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "Failed to create player records" },
        { status: 500 },
      );
    }

    // Create admin notification
    let notificationMessage = actualRequireDeposit
      ? `Booking ${bookingRef} created. Customer: ${customerName}. Deposit: IDR ${totalAmount.toLocaleString(
          "id-ID",
        )}. Balance: IDR ${actualRemainingBalance.toLocaleString("id-ID")}.`
      : `Booking ${bookingRef} created. Customer: ${customerName}. Full payment: IDR ${totalAmount.toLocaleString(
          "id-ID",
        )}.`;

    await supabase.from("admin_notifications").insert({
      booking_id: booking.id,
      type: "NEW_BOOKING",
      title: "New Booking Created",
      message: notificationMessage,
      read: false,
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingRef: booking.booking_ref,
        status: booking.status,
        requireDeposit: booking.require_deposit,
        depositAmount: booking.deposit_amount,
        remainingBalance: booking.remaining_balance,
        paymentChoice: booking.customer_payment_choice,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

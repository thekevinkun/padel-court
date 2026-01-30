import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  lookupIpLimiter,
  getClientIp,
  createRateLimitResponse,
} from "@/lib/rate-limit";

// Endpoint to lookup a booking by email and booking reference
export async function POST(request: NextRequest) {
  try {
    // RATE LIMITING - Prevent brute-force attacks
    const clientIp = getClientIp(request);
    const { success, reset, remaining } = await lookupIpLimiter.limit(clientIp);

    // If rate limit exceeded, return 429 response
    if (!success) {
      const error = createRateLimitResponse(false, reset, remaining, "lookup");
      console.log(`🚫 Lookup rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(error, {
        status: 429,
        headers: {
          "Retry-After": error!.retryAfter.toString(),
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }

    const body = await request.json();
    const { email, bookingRef } = body;

    console.log("🔍 Booking lookup request:", { email, bookingRef });

    // Validate required fields
    if (!email || !bookingRef) {
      return NextResponse.json(
        { error: "Email and booking reference are required" },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Find booking by email AND booking ref (security: both must match)
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
    *,
    courts (id, name, description, available),
    venue_payments (*),
    booking_time_slots (
      id,
      time_slot_id,
      time_slots (time_start, time_end, period, price_per_person)
    ),
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
      .eq("customer_email", email.toLowerCase().trim())
      .eq("booking_ref", bookingRef.toUpperCase().trim())
      .single();

    if (error || !booking) {
      console.log("❌ Booking not found:", { email, bookingRef });
      return NextResponse.json(
        {
          error:
            "Booking not found. Please check your email and booking reference.",
          found: false,
        },
        { status: 404 },
      );
    }

    console.log("✅ Booking found:", booking.booking_ref);

    // Return booking details
    return NextResponse.json({
      success: true,
      found: true,
      booking,
    });
  } catch (error) {
    console.error("❌ Booking lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

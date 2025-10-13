import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courtId = searchParams.get("courtId");
    const date = searchParams.get("date");

    // Validate required parameters
    if (!courtId || !date) {
      return NextResponse.json(
        { error: "courtId and date are required" },
        { status: 400 }
      );
    }

    // Fetch available time slots
    const { data: slots, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("court_id", courtId)
      .eq("date", date)
      .eq("available", true)
      .order("time_start", { ascending: true });

    if (error) {
      console.error("Error fetching time slots:", error);
      return NextResponse.json(
        { error: "Failed to fetch time slots" },
        { status: 500 }
      );
    }

    // Format the response to match your existing format
    const formattedSlots = slots.map((slot) => ({
      id: slot.id,
      time: `${slot.time_start.substring(0, 5)} - ${slot.time_end.substring(0, 5)}`,
      available: slot.available,
      period: slot.period,
      pricePerPerson: slot.price_per_person,
    }));

    return NextResponse.json({
      success: true,
      slots: formattedSlots,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
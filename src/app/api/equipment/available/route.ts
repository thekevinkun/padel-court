import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data: equipment, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching equipment:", error);
      return NextResponse.json(
        { error: "Failed to fetch equipment" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      equipment: equipment || [],
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

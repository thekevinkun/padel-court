import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const authSupabase = await createAuthClient();

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check admin role
    const supabase = createServerClient();

    const { data: adminRole, error: roleError } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !adminRole) {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { days = 30, startDate } = body; // Generate 30 days by default

    console.log(`🔄 Generating time slots for ${days} days...`);

    // Get start date (default to today)
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    // Get all available courts
    const { data: courts, error: courtsError } = await supabase
      .from("courts")
      .select("id, name")
      .eq("available", true);

    if (courtsError || !courts || courts.length === 0) {
      return NextResponse.json(
        { error: "No available courts found" },
        { status: 400 }
      );
    }

    console.log(`📍 Found ${courts.length} courts`);

    // Time slot configuration
    const slotConfig = [
      // Morning Peak: 06:00 - 10:00
      { start: 6, end: 10, period: "peak", price: 100000 },
      // Off-Peak: 10:00 - 15:00
      { start: 10, end: 15, period: "off-peak", price: 60000 },
      // Evening Peak: 15:00 - 22:00
      { start: 15, end: 22, period: "peak", price: 100000 },
    ];

    let totalGenerated = 0;
    let skippedExisting = 0;

    // Generate slots for each day
    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const targetDate = new Date(start);
      targetDate.setDate(start.getDate() + dayOffset);
      const dateStr = targetDate.toISOString().split("T")[0];

      // Generate slots for each court
      for (const court of courts) {
        for (const config of slotConfig) {
          for (let hour = config.start; hour < config.end; hour++) {
            const timeStart = `${hour.toString().padStart(2, "0")}:00:00`;
            const timeEnd = `${(hour + 1).toString().padStart(2, "0")}:00:00`;

            try {
              // Check if slot already exists
              const { data: existing } = await supabase
                .from("time_slots")
                .select("id")
                .eq("court_id", court.id)
                .eq("date", dateStr)
                .eq("time_start", timeStart)
                .single();

              if (existing) {
                skippedExisting++;
                continue; // Skip if already exists
              }

              // Insert new time slot
              const { error: insertError } = await supabase
                .from("time_slots")
                .insert({
                  court_id: court.id,
                  date: dateStr,
                  time_start: timeStart,
                  time_end: timeEnd,
                  period: config.period,
                  price_per_person: config.price,
                  available: true,
                });

              if (insertError) {
                console.error(`❌ Error inserting slot:`, insertError);
              } else {
                totalGenerated++;
              }
            } catch (error) {
              console.error(`❌ Error processing slot:`, error);
            }
          }
        }
      }
    }

    console.log(`✅ Generated ${totalGenerated} new time slots`);
    console.log(`⏭️  Skipped ${skippedExisting} existing slots`);

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${totalGenerated} time slots for ${days} days`,
      generated: totalGenerated,
      skipped: skippedExisting,
      startDate: start.toISOString().split("T")[0],
      endDate: new Date(start.getTime() + (days - 1) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
  } catch (error) {
    console.error("❌ Error generating time slots:", error);
    return NextResponse.json(
      {
        error: "Failed to generate time slots",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

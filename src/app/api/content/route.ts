import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Fetch all active sections ordered by section_order
    const { data: sections, error } = await supabase
      .from("content_sections")
      .select("section_type, section_order, content, version, updated_at")
      .eq("is_active", true)
      .order("section_order", { ascending: true });

    if (error) {
      console.error("Error fetching content sections:", error);
      return NextResponse.json(
        { error: "Failed to fetch content" },
        { status: 500 }
      );
    }

    // Transform to object format for easier frontend access
    const contentMap = sections.reduce((acc, section) => {
      acc[section.section_type] = {
        content: section.content,
        version: section.version,
        order: section.section_order,
        updatedAt: section.updated_at,
      };
      return acc;
    }, {} as Record<string, any>);

    // Also return as array for ordered rendering
    const contentArray = sections.map((section) => ({
      type: section.section_type,
      content: section.content,
      version: section.version,
      order: section.section_order,
      updatedAt: section.updated_at,
    }));

    return NextResponse.json(
      {
        success: true,
        sections: contentMap, // Object format: { hero: {...}, welcome: {...} }
        ordered: contentArray, // Array format ordered by section_order
      },
      {
        headers: {
          // Cache for 60 seconds in browser, revalidate in background
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
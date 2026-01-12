import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = createServerClient();

    const { data: settings, error } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        settings,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
          "X-Fetched-At": new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error in GET /api/settings:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Use auth client to check user session
    const authSupabase = await createAuthClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    console.log("🔍 Auth Debug:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
    });

    if (authError || !user) {
      console.error("❌ Auth failed:", authError);
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Use service role client to check admin role
    const supabase = createServerClient();

    const { data: adminRole, error: roleError } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    console.log("🔍 Admin Check:", {
      hasAdminRole: !!adminRole,
      role: adminRole?.role,
      roleError: roleError?.message,
    });

    if (roleError || !adminRole) {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.business_name || !body.email || !body.phone || !body.whatsapp) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: business_name, email, phone, whatsapp",
        },
        { status: 400 }
      );
    }

    // Extract fields from body
    const {
      business_name,
      business_description,
      logo_url,
      email,
      phone,
      whatsapp,
      address,
      google_maps_url,
      facebook_url,
      instagram_url,
      whatsapp_community_url,
      operating_hours,
      min_advance_booking,
      max_advance_booking,
      cancellation_window,
      require_deposit,
      deposit_percentage,
      payment_settings,
      notification_settings,
      meta_title,
      meta_description,
      meta_keywords,
      og_image,
    } = body;

    // Update settings using service role client
    const { data: updatedSettings, error: updateError } = await supabase
      .from("site_settings")
      .update({
        business_name,
        business_description,
        logo_url,
        email,
        phone,
        whatsapp,
        address,
        google_maps_url,
        facebook_url,
        instagram_url,
        whatsapp_community_url,
        operating_hours,
        min_advance_booking,
        max_advance_booking,
        cancellation_window,
        require_deposit,
        deposit_percentage,
        payment_settings,
        notification_settings,
        meta_title,
        meta_description,
        meta_keywords,
        og_image,
      })
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .select()
      .single();

    if (updateError) {
      console.error("Error updating settings:", updateError);
      return NextResponse.json(
        {
          error: "Failed to update settings",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    // Revalidate cached pages
    try {
      revalidatePath("/");
      revalidatePath("/api/settings");
      console.log("✅ Settings cache revalidated");
    } catch (revalidateError) {
      console.warn("⚠️ Cache revalidation failed:", revalidateError);
    }

    console.log(
      `✅ Settings updated by user: ${
        user.email
      } at ${new Date().toISOString()}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Settings updated successfully",
        settings: updatedSettings,
      },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error in PUT /api/settings:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

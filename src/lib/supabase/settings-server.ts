import { createServerClient } from "@/lib/supabase/server";

export async function getSettingsData() {
  try {
    const supabase = createServerClient();

    const { data: settings, error } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching settings (server-side):", error);
      return null;
    }

    return settings;
  } catch (error) {
    console.error("Unexpected error in getSettingsData:", error);
    return null;
  }
}

import { useEffect, useState } from "react";
import { SiteSettings } from "@/types/settings";

/**
 * Hook to fetch and cache site settings
 * Can be used in any client component
 */
export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
      } else {
        throw new Error("Invalid settings response");
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings, // Allow manual refetch if needed
  };
}

import { createServerClient } from "@/lib/supabase/server";
import {
  HeroContent,
  WelcomeContent,
  FeaturesContent,
  PricingContent,
  ContentSections,
} from "@/types";

/**
 * Fetch all active content sections from database
 * Will runs on the server side only
 */
export async function getContentSections(): Promise<ContentSections> {
  try {
    const supabase = createServerClient();

    const { data: sections, error } = await supabase
      .from("content_sections")
      .select("section_type, content")
      .eq("is_active", true)
      .order("section_order", { ascending: true });

    if (error) {
      console.error("Error fetching content sections:", error);
      return {
        hero: null,
        welcome: null,
        features: null,
        pricing: null,
      };
    }

    // Map sections to typed object
    const content: ContentSections = {
      hero: null,
      welcome: null,
      features: null,
      pricing: null,
    };

    sections.forEach((section) => {
      switch (section.section_type) {
        case "hero":
          content.hero = section.content as HeroContent;
          break;
        case "welcome":
          content.welcome = section.content as WelcomeContent;
          break;
        case "features":
          content.features = section.content as FeaturesContent;
          break;
        case "pricing":
          content.pricing = section.content as PricingContent;
          break;
      }
    });

    return content;
  } catch (error) {
    console.error("Unexpected error fetching content:", error);
    return {
      hero: null,
      welcome: null,
      features: null,
      pricing: null,
    };
  }
}

/**
 * Get individual section content
 */
export async function getSectionContent<T>(
  sectionType: string
): Promise<T | null> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("content_sections")
      .select("content")
      .eq("section_type", sectionType)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      console.error(`Error fetching ${sectionType} section:`, error);
      return null;
    }

    return data.content as T;
  } catch (error) {
    console.error(`Unexpected error fetching ${sectionType}:`, error);
    return null;
  }
}

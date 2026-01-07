import { createServerClient } from "@/lib/supabase/server";
import {
  HeroContent,
  WelcomeContent,
  FeaturesContent,
  Court,
  TestimonialsContent,
  PricingContent,
  GalleryContent,
  ContentSections,
} from "@/types";

// Update ContentSections type to include courts
export interface ContentSectionsWithCourts extends ContentSections {
  courts: Court[];
}

/**
 * Fetch all active content sections + courts from database
 * Runs on the server side only
 */
export async function getContentSections(): Promise<ContentSectionsWithCourts> {
  try {
    const supabase = createServerClient();

    // Fetch content sections
    const { data: sections, error: sectionsError } = await supabase
      .from("content_sections")
      .select("section_type, content")
      .eq("is_active", true)
      .order("section_order", { ascending: true });

    // Fetch courts (only available ones)
    const { data: courts, error: courtsError } = await supabase
      .from("courts")
      .select("*")
      .eq("available", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (sectionsError) {
      console.error("Error fetching content sections:", sectionsError);
    }

    if (courtsError) {
      console.error("Error fetching courts:", courtsError);
    }

    // Map sections to typed object
    const content: ContentSectionsWithCourts = {
      hero: null,
      welcome: null,
      features: null,
      courts: courts || [], // Add courts array
      testimonials: null,
      pricing: null,
      gallery: null,
    };

    // Map sections if they exist
    if (sections) {
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
          case "testimonials":
            content.testimonials = section.content as TestimonialsContent;
            break;
          case "pricing":
            content.pricing = section.content as PricingContent;
            break;
          case "gallery":
            content.gallery = section.content as GalleryContent;
            break;
        }
      });
    }

    return content;
  } catch (error) {
    console.error("Unexpected error fetching content:", error);
    return {
      hero: null,
      welcome: null,
      features: null,
      testimonials: null,
      pricing: null,
      courts: [],
      gallery: null,
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

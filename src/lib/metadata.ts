import { Metadata } from "next";

/**
 * Generates metadata for pages based on settings
 * Can be used in any page's metadata export
*/
export function generateSiteMetadata(
  settings: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_image: string;
    business_name: string;
  },
  pageTitle?: string,
  pageDescription?: string
): Metadata {
  const title = pageTitle || settings.meta_title;
  const description = pageDescription || settings.meta_description;
  
  // Construct full URL for OG image
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const ogImageUrl = settings.og_image.startsWith("http") 
    ? settings.og_image 
    : `${siteUrl}${settings.og_image}`;

  return {
    title: {
      default: settings.meta_title,
      template: `%s | ${settings.business_name}`, // e.g., "Pricing | Padel Batu Alam Permai"
    },
    description: description,
    keywords: settings.meta_keywords.split(",").map(k => k.trim()),
    
    // Open Graph (Facebook, LinkedIn, etc.)
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: siteUrl,
      siteName: settings.business_name,
      title: title,
      description: description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: settings.business_name,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [ogImageUrl],
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Verification (if you have these)
    verification: {
      // google: "your-google-verification-code",
      // yandex: "your-yandex-verification-code",
    },

    // Alternate languages (if you support multiple languages)
    alternates: {
      canonical: siteUrl,
    },
  };
}

/**
 * Default/fallback metadata (used if settings fail to load)
 */
export const defaultMetadata: Metadata = {
  title: "Padel Batu Alam Permai - Book Your Court Online",
  description: "Book padel courts instantly. Best courts in Batu Alam Permai with easy online booking.",
  keywords: ["padel", "samarinda", "sports", "booking", "court", "batu alam permai"],
  
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Padel Batu Alam Permai",
    title: "Padel Batu Alam Permai - Book Your Court Online",
    description: "Book padel courts instantly. Best courts in Batu Alam Permai with easy online booking.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Padel Batu Alam Permai - Book Your Court Online",
    description: "Book padel courts instantly. Best courts in Batu Alam Permai with easy online booking.",
  },

  robots: {
    index: true,
    follow: true,
  },
};
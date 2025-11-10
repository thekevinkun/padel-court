"use client";

import { useSettings } from "@/hooks/useSettings";

export default function StructuredData() {
  const { settings } = useSettings();

  if (!settings) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: settings.business_name,
    description: settings.business_description,
    image: settings.og_image,
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Samarinda",
      addressRegion: "Kalimantan Timur",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      // Add actual coordinates later
      // latitude: "-0.5021",
      // longitude: "117.1536",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: settings.operating_hours.weekday.open,
        closes: settings.operating_hours.weekday.close,
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: settings.operating_hours.weekend.open,
        closes: settings.operating_hours.weekend.close,
      },
    ],
    sameAs: [
      settings.facebook_url,
      settings.instagram_url,
    ].filter(Boolean),
    priceRange: "IDR",
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Padel Courts",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Online Booking",
        value: true,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
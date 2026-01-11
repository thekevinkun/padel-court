import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import StructuredData from "@/components/StructuredData";
import ClientProviders from "@/providers/ClientProviders";
import { generateSiteMetadata, defaultMetadata } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

/* Generate metadata from settings */
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch settings from API
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/settings`,
      {
        // Important: Don't cache during build, but cache at runtime
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }

    const data = await response.json();
    if (data.success && data.settings) {
      return generateSiteMetadata(data.settings);
    }

    // Fallback to default metadata
    return defaultMetadata;
  } catch (error) {
    console.error("Error generating metadata:", error);
    // Fallback to default metadata
    return defaultMetadata;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <StructuredData />
        <link
          rel="preconnect"
          href="https://gqhjwptcfqdwawsfojcw.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://gqhjwptcfqdwawsfojcw.supabase.co"
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import StructuredData from "@/components/StructuredData";
import ClientProviders from "@/providers/ClientProviders";
import { getSettingsData } from "@/lib/supabase/settings-server";
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
    // Use the direct function call instead of fetch()
    const settings = await getSettingsData();

    if (settings) {
      return generateSiteMetadata(settings);
    }

    return defaultMetadata;
  } catch (error) {
    console.error("Error generating metadata:", error);
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

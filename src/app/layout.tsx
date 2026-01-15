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
  adjustFontFallback: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
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
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        {/* PWA Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme Color (for mobile browsers) */}
        <meta name="theme-color" content="#E9FF00" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#E9FF00"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0D1301"
        />

        {/* Mobile Web App Capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Padel BAP" />

        {/* Preload supabase connect */}
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

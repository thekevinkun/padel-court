import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage domains
      {
        protocol: "https",
        hostname: "gqhjwptcfqdwawsfojcw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // Unsplash permission domains
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    
    // Fix warning: Define allowed quality values
    qualities: [70, 75, 80, 85, 90, 95, 100],

    // AVIF + WebP support (better compression)
    formats: ["image/avif", "image/webp"],

    // Responsive image sizes (optimized for layout)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // // Disable image optimization for build (speeds up builds)
    // // Set to true for production, false for dev
    // unoptimized: process.env.NODE_ENV === "development" ? false : false,

    // Minimize file size
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds
  },

  // Remove console logs in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"], // Keep errors/warnings
          }
        : false,
  },

  // // Optimize bundle size
  // swcMinify: true, // Use SWC for faster minification

  // Enable experimental features
  experimental: {
    // Optimize package imports (reduces bundle size)
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "date-fns",
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/images/:all*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

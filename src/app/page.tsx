import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Welcome from "@/components/home/Welcome";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import Courts from "@/components/home/Courts";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/layout/Footer";
import BookingDialogWrapper from "@/components/booking/BookingDialogWrapper";
import { getContentSections } from "@/lib/content";
import {
  heroInitial,
  welcomeInitial,
  featuresInitial,
  pricingInitial,
} from "@/lib/constants";

// This is now a Server Component (no "use client")
export default async function Home() {
  // Fetch content server-side before rendering
  const sections = await getContentSections();

  // Use database content or fallback to initial
  const heroContent = sections.hero || heroInitial;
  const welcomeContent = sections.welcome || welcomeInitial;
  const featuresContent = sections.features || { items: featuresInitial };
  const pricingContent = sections.pricing || pricingInitial;
  const courts = sections.courts || [];

  return (
    <>
      <main className="min-h-screen">
        {/* Client component wrapper handles navbar interactivity */}
        <Navbar />
        
        {/* All content is pre-rendered server-side */}
        <Hero content={heroContent} />
        <Welcome content={welcomeContent} />
        <FeaturesGrid content={featuresContent} />
        <Courts courts={courts} />
        <Pricing content={pricingContent} />
        <Footer />
      </main>

      {/* Booking dialog wrapper (client component) - outside main for portal */}
      <BookingDialogWrapper />
    </>
  );
}

// Optional: Add revalidation for ISR (Incremental Static Regeneration)
export const revalidate = 300; // Revalidate every 5 minutes
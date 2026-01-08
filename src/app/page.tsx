import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Welcome from "@/components/home/Welcome";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import Courts from "@/components/home/Courts";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import Gallery from "@/components/home/Gallery";
import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";
import BookingDialogWrapper from "@/components/booking/BookingDialogWrapper";

import { getContentSections } from "@/lib/content";
import {
  heroInitial,
  welcomeInitial,
  featuresInitial,
  testimonialsInitial,
  pricingInitial,
  galleryInitial,
  ctaInitial,
} from "@/lib/constants";

export default async function Home() {
  // Fetch content server-side before rendering
  const sections = await getContentSections();

  // Use database content or fallback to initial
  const heroContent = sections.hero || heroInitial;
  const welcomeContent = sections.welcome || welcomeInitial;
  const featuresContent = sections.features || { items: featuresInitial };
  const testimonialsContent = sections.testimonials || testimonialsInitial;
  const pricingContent = sections.pricing || pricingInitial;
  const galleryContent = sections.gallery || galleryInitial;
  const ctaContent = sections.cta || ctaInitial;
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
        <Testimonials content={testimonialsContent} />
        <Pricing content={pricingContent} />
        <Gallery content={galleryContent} />
        <CTA content={ctaContent} />
        <Footer />
      </main>

      {/* Booking dialog wrapper (client component) - outside main for portal */}
      <BookingDialogWrapper />
    </>
  );
}

// Add revalidation for ISR (Incremental Static Regeneration)
export const revalidate = 300; // Revalidate every 5 minutes

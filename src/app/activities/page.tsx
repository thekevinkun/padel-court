import Navbar from "@/components/layout/Navbar";
import PageHero from "@/components/pages/PageHero";
import Activities from "@/components/pages/Activities";
import Gallery from "@/components/home/Gallery";
import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";
import BookingDialogWrapper from "@/components/booking/BookingDialogWrapper";

import { galleryInitial, ctaInitial } from "@/lib/constants";
import { getContentSections, getPageHero, getActivities } from "@/lib/content";

export default async function ActivitiesPage() {
  // Fetch content server-side
  const sections = await getContentSections();
  const pageHero = await getPageHero("activities");
  const activities = await getActivities();

  // Use database content or fallback to defaults
  const galleryContent = sections.gallery || galleryInitial;
  const ctaContent = sections.cta || ctaInitial;

  // Fallback hero content if not in database
  const heroContent = pageHero || {
    title: "Our Great Activities",
    subtitle: "Experience the vibrant padel community and exciting events",
    image_url: "/images/placeholder-court.webp",
  };

  return (
    <>
      <main className="min-h-screen">
        <Navbar />
        <PageHero content={heroContent} />

        {/* Activities Section */}
        <Activities activities={activities} />

        <Gallery content={galleryContent} />
        <CTA content={ctaContent} />
        <Footer />
      </main>
      <BookingDialogWrapper />
    </>
  );
}

export const revalidate = 300;

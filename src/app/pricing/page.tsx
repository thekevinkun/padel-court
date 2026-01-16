import Navbar from "@/components/layout/Navbar";
import PageHero from "@/components/pages/PageHero";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/layout/Footer";
import BookingDialogWrapper from "@/components/booking/BookingDialogWrapper";

import { pricingInitial } from "@/lib/constants";
import { getContentSections, getPageHero } from "@/lib/content";

export default async function PricingPage() {
  const sections = await getContentSections();
  const pageHero = await getPageHero("pricing");

  const pricingContent = sections.pricing || pricingInitial;
  const heroContent = pageHero || {
    title: "Our Pricing List",
    subtitle: "Transparent pricing for courts, coaching, and equipment",
    image_url: "/images/placeholder-court.webp",
  };

  return (
    <>
      <main className="min-h-screen">
        <Navbar />
        <PageHero content={heroContent} />
        <Pricing content={pricingContent} />
        <Footer />
      </main>
      <BookingDialogWrapper />
    </>
  );
}

export const revalidate = 300;

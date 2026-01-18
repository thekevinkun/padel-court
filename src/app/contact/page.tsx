import Navbar from "@/components/layout/Navbar";
import PageHero from "@/components/pages/PageHero";
import Contact from "@/components/pages/Contact";
import Footer from "@/components/layout/Footer";
import BookingDialogWrapper from "@/components/booking/BookingDialogWrapper";

import { getPageHero } from "@/lib/content";

export default async function ContactPage() {
  // Fetch page hero
  const pageHero = await getPageHero("contact");

  const heroContent = pageHero || {
    title: "Get In Touch",
    subtitle: "We're here to help you get started with padel",
    image_url: "/images/placeholder-court.webp",
  };

  return (
    <>
      <main className="min-h-screen">
        <Navbar />
        <PageHero content={heroContent} />
        <Contact />
        <Footer />
      </main>
      <BookingDialogWrapper />
    </>
  );
}

export const revalidate = 300;

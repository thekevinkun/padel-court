import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import PageHero from "@/components/pages/PageHero";
import Courts from "@/components/home/Courts";
import Footer from "@/components/layout/Footer";
import BookingDialogWrapper from "@/components/booking/BookingDialogWrapper";

import { getContentSections, getPageHero } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Courts",
  description: "World-class facilities designed for players of all levels.",
};

export default async function CourtsPage() {
  const sections = await getContentSections();
  const pageHero = await getPageHero("courts");

  const courts = sections.courts || [];
  const heroContent = pageHero || {
    title: "Our Courts",
    subtitle: "World-class facilities designed for players of all levels",
    image_url: "/images/placeholder-court.webp",
  };

  return (
    <>
      <main className="min-h-screen">
        <Navbar />
        <PageHero content={heroContent} />
        <Courts courts={courts} />
        <Footer />
      </main>
      <BookingDialogWrapper />
    </>
  );
}

export const revalidate = 300;

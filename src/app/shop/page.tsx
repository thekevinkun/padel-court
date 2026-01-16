import Navbar from "@/components/layout/Navbar";
import PageHero from "@/components/pages/PageHero";
import Footer from "@/components/layout/Footer";
import BookingDialogWrapper from "@/components/booking/BookingDialogWrapper";

import { getPageHero } from "@/lib/content";

export default async function ShopPage() {
  const pageHero = await getPageHero("shop");

  const heroContent = pageHero || {
    title: "Padel Shop",
    subtitle: "Premium equipment and gear for your game",
    image_url: "/images/placeholder-court.webp",
  };

  return (
    <>
      <main className="min-h-screen">
        <Navbar />
        <PageHero content={heroContent} />
        {/* Shop content will be added later */}
        <Footer />
      </main>
      <BookingDialogWrapper />
    </>
  );
}

export const revalidate = 300;

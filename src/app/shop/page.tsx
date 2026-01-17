import Navbar from "@/components/layout/Navbar";
import PageHero from "@/components/pages/PageHero";
import ShopWelcome from "@/components/pages/ShopWelcome";
import ShopProducts from "@/components/pages/ShopProducts";
import Footer from "@/components/layout/Footer";
import BookingDialogWrapper from "@/components/booking/BookingDialogWrapper";
import { getPageHero, getShopWelcome, getShopProducts } from "@/lib/content";

import { shopWelcomeInitial } from "@/lib/constants";

export default async function ShopPage() {
  // Fetch content server-side
  const pageHero = await getPageHero("shop");
  const shopWelcome = await getShopWelcome();
  const shopProducts = await getShopProducts();

  // Use database or fallback
  const shopWelcomeContent = shopWelcome || shopWelcomeInitial;

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
        <ShopWelcome content={shopWelcomeContent} />
        <ShopProducts products={shopProducts} />
        <Footer />
      </main>
      <BookingDialogWrapper />
    </>
  );
}

export const revalidate = 300;

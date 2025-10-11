import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Welcome from "@/components/home/Welcome";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Welcome />
      <FeaturesGrid />
      <Pricing />
      <Footer />
    </main>
  );
}

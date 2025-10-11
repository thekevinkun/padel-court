import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Welcome from "@/components/home/Welcome";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import Pricing from "@/components/home/Pricing";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Welcome />
      <FeaturesGrid />
      <Pricing />

      {/* Temporary section to test scrolling */}
      <section className="section-py bg-white">
        <div className="container-custom">
          <h2 className="heading-2 text-center">More content coming soon...</h2>
          <p className="text-body text-center mt-4">
            Scroll up to see the navbar color change!
          </p>
        </div>
      </section>
    </main>
  );
}

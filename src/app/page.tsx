"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Welcome from "@/components/home/Welcome";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/layout/Footer";
import BookingDialog from "@/components/booking/BookingDialog";

import {
  HeroContent,
  WelcomeContent,
  FeaturesContent,
  PricingContent,
} from "@/types";
import {
  heroInitial,
  welcomeInitial,
  featuresInitial,
  pricingInitial,
} from "@/lib/constants";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Content state
  const [heroContent, setHeroContent] = useState<HeroContent>(heroInitial);
  const [welcomeContent, setWelcomeContent] =
    useState<WelcomeContent>(welcomeInitial);
  const [featuresContent, setFeaturesContent] = useState<FeaturesContent>({
    items: featuresInitial,
  });
  const [pricingContent, setPricingContent] =
    useState<PricingContent>(pricingInitial);

  const openBooking = () => setIsBookingOpen(true);
  const closeBooking = () => setIsBookingOpen(false);

  // Fetch content from API on mount
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/content");

      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }

      const data = await response.json();

      if (data.success && data.sections) {
        // Update state with database content (fallback to initial if null)
        if (data.sections.hero) {
          setHeroContent(data.sections.hero.content);
        }
        if (data.sections.welcome) {
          setWelcomeContent(data.sections.welcome.content);
        }
        if (data.sections.features) {
          setFeaturesContent(data.sections.features.content);
        }
        if (data.sections.pricing) {
          setPricingContent(data.sections.pricing.content);
        }

        console.log("✅ Content loaded from database");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      console.log("⚠️ Using default content");
      // Keep using initial/fallback content
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar onBookNowClick={openBooking} />
      <Hero content={heroContent} onBookNowClick={openBooking} />
      <Welcome content={welcomeContent} />
      <FeaturesGrid content={featuresContent} />
      <Pricing content={pricingContent} />
      <Footer />

      {/* Booking Dialog */}
      <BookingDialog open={isBookingOpen} onOpenChange={setIsBookingOpen} />
    </main>
  );
}

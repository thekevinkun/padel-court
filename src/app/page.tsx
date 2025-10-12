"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Welcome from "@/components/home/Welcome";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/layout/Footer";
import BookingDialog from "@/components/booking/BookingDialog";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const openBooking = () => setIsBookingOpen(true);
  const closeBooking = () => setIsBookingOpen(false);

  return (
    <main className="min-h-screen">
      <Navbar onBookNowClick={openBooking} />
      <Hero onBookNowClick={openBooking} />
      <Welcome />
      <FeaturesGrid />
      <Pricing />
      <Footer />
      
      {/* Booking Dialog */}
      <BookingDialog open={isBookingOpen} onOpenChange={setIsBookingOpen} />
    </main>
  );
}
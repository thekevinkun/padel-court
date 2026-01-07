"use client";

import { ParallaxProvider } from "react-scroll-parallax";
import { BookingProvider } from "@/contexts/BookingContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ParallaxProvider>
      <BookingProvider>{children}</BookingProvider>
    </ParallaxProvider>
  );
}

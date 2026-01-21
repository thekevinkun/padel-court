import type { Metadata } from "next";
import { Suspense } from "react";
import MyBookingClient from "@/clients/MyBookingClient";

export const metadata: Metadata = {
  title: "Find My Booking | Padel Batu Alam Permai",
  description:
    "Look up your Padel court booking using your email and booking reference.",
};

export default function MyBookingPage() {
  return (
    <Suspense fallback={null}>
      <MyBookingClient />
    </Suspense>
  );
}

import type { Metadata } from "next";
import CourtsPageClient from "@/clients/CourtsPageClient";

export const metadata: Metadata = {
  title: "Courts Management - Admin Dashboard | Padel Batu Alam Permai",
  description:
    "Oversee and configure padel courts, including details, availability, and maintenance schedules for Padel Batu Alam Permai. Ensure optimal court management for bookings and operations.",
};

export default function CourtsPage() {
  return <CourtsPageClient />;
}
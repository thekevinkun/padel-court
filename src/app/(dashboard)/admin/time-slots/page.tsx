import type { Metadata } from "next";
import TimeSlotsPageClient from "@/clients/TimeSlotsPageClient";

export const metadata: Metadata = {
  title: "Time Slots Management - Admin Dashboard | Padel Batu Alam Permai",
  description:
    "Configure and manage available time slots for court bookings at Padel Batu Alam Permai. Set schedules, availability, and pricing to streamline reservations and maximize facility usage.",
};

export default function TimeSlotsPage() {
  return <TimeSlotsPageClient />;
}
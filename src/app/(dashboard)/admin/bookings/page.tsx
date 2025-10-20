import type { Metadata } from "next";
import BookingsPageClient from "@/clients/BookingsPageClient";

export const metadata: Metadata = {
  title: "Bookings - Admin Dashboard | Padel Batu Alam Permai",
  description:
    "View and manage all bookings, including customer details, payments, and court reservations for Padel Batu Alam Permai.",
};

export default function BookingsPage() {
  return <BookingsPageClient />;
}
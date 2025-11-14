import type { Metadata } from "next";
import BookingDetailClient from "@/clients/BookingDetailClient";

export const metadata: Metadata = {
  title: "Booking Detail - Admin Dashboard | Padel Batu Alam Permai",
  description: "View and manage individual booking details",
};

export default function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <BookingDetailClient bookingId={params.id} />;
}
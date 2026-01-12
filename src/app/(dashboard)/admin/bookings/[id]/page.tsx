import type { Metadata } from "next";
import BookingDetailClient from "@/clients/BookingDetailClient";

export const metadata: Metadata = {
  title: "Booking Detail - Admin Dashboard | Padel Batu Alam Permai",
  description: "View and manage individual booking details",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: bookingId } = await params;
  return <BookingDetailClient bookingId={bookingId} />;
}

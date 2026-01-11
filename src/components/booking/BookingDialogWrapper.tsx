"use client";

import dynamic from "next/dynamic";
import { useBooking } from "@/contexts/BookingContext";

const BookingDialog = dynamic(() => import("@/components/booking/BookingDialog"), {
  ssr: false,
  loading: () => null,
});

export default function BookingDialogWrapper() {
  const { isOpen, closeBooking } = useBooking();

  return <BookingDialog open={isOpen} onOpenChange={closeBooking} />;
}

"use client";

import BookingDialog from "@/components/booking/BookingDialog";
import { useBooking } from "@/contexts/BookingContext";

export default function BookingDialogWrapper() {
  const { isOpen, closeBooking } = useBooking();

  return <BookingDialog open={isOpen} onOpenChange={closeBooking} />;
}

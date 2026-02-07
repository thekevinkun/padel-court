import { Booking } from "@/types/booking";

/**
 * Check if success page access is still valid (within 24 hours of payment)
 */
export function isSuccessPageAccessValid(booking: Booking): boolean {
  // Never paid - invalid
  if (!booking.paid_at) {
    return false;
  }

  // Not in paid status - invalid (cancelled, refunded, etc.)
  if (booking.status !== "PAID") {
    return false;
  }

  // Check if within 24 hour window
  const paidAt = new Date(booking.paid_at);
  const now = new Date();
  const hoursSincePaid = (now.getTime() - paidAt.getTime()) / (1000 * 60 * 60);

  return hoursSincePaid < 24;
}

/**
 * Get redirect URL for My Booking with pre-filled params
 */
export function getMyBookingRedirectUrl(booking: Booking): string {
  const params = new URLSearchParams({
    email: booking.customer_email,
    booking_ref: booking.booking_ref,
  });
  return `/my-booking?${params.toString()}`;
}

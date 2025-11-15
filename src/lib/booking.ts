import { Booking, VenuePaymentStatus, SessionStatus } from "@/types/booking";

// Helper function to determine venue payment status
export function getVenuePaymentStatus(booking: Booking): VenuePaymentStatus {
  if (!booking.require_deposit) {
    return 'COMPLETED'; // No venue payment needed for full payment
  }
  
  if (booking.venue_payment_received) {
    return 'COMPLETED';
  }
  
  if (booking.venue_payment_expired) {
    return 'EXPIRED';
  }
  
  return 'PENDING';
}

// Helper function to check if booking time has passed
export function hasBookingTimePassed(booking: Booking): boolean {
  const bookingDate = new Date(booking.date);
  const timeEnd = booking.time.split(' - ')[1]; // "09:00 - 10:00" -> "10:00"
  const [hours, minutes] = timeEnd.split(':').map(Number);
  
  bookingDate.setHours(hours, minutes, 0, 0);
  
  return new Date() > bookingDate;
}

// Helper function to check if booking is currently active
export function isBookingActive(booking: Booking): boolean {
  const bookingDate = new Date(booking.date);
  const [timeStart, timeEnd] = booking.time.split(' - ');
  
  const [startHours, startMinutes] = timeStart.split(':').map(Number);
  const [endHours, endMinutes] = timeEnd.split(':').map(Number);
  
  const startTime = new Date(bookingDate);
  startTime.setHours(startHours, startMinutes, 0, 0);
  
  const endTime = new Date(bookingDate);
  endTime.setHours(endHours, endMinutes, 0, 0);
  
  const now = new Date();
  
  return now >= startTime && now <= endTime;
}

// Helper to get session status badge color
export function getSessionStatusColor(status: SessionStatus): string {
  switch (status) {
    case 'UPCOMING':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-green-100 text-green-800';
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
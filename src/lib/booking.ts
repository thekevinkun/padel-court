import { Booking, VenuePaymentStatus, SessionStatus } from "@/types/booking";

// Helper function to determine venue payment status
export function getVenuePaymentStatus(booking: Booking): VenuePaymentStatus {
  if (!booking.require_deposit) {
    return "COMPLETED"; // No venue payment needed for full payment
  }

  if (booking.venue_payment_received) {
    return "COMPLETED";
  }

  if (booking.venue_payment_expired) {
    return "EXPIRED";
  }

  return "PENDING";
}

// Helper function to check if booking time has passed
export function hasBookingTimePassed(booking: Booking): boolean {
  const bookingDate = new Date(booking.date);
  const timeEnd = booking.time.split(" - ")[1]; // "09:00 - 10:00" -> "10:00"
  const [hours, minutes] = timeEnd.split(":").map(Number);

  bookingDate.setHours(hours, minutes, 0, 0);

  return new Date() > bookingDate;
}

// Helper function to check if booking is currently active
export function isBookingActive(booking: Booking): boolean {
  const bookingDate = new Date(booking.date);
  const [timeStart, timeEnd] = booking.time.split(" - ");

  const [startHours, startMinutes] = timeStart.split(":").map(Number);
  const [endHours, endMinutes] = timeEnd.split(":").map(Number);

  const startTime = new Date(bookingDate);
  startTime.setHours(startHours, startMinutes, 0, 0);

  const endTime = new Date(bookingDate);
  endTime.setHours(endHours, endMinutes, 0, 0);

  const now = new Date();

  return now >= startTime && now <= endTime;
}

// Helper Format date relative to today
export const formatRelativeDate = (dateStr: string): string => {
  const bookingDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  bookingDate.setHours(0, 0, 0, 0);

  if (bookingDate.getTime() === today.getTime()) {
    return "today";
  } else if (bookingDate.getTime() === tomorrow.getTime()) {
    return "tomorrow";
  } else {
    // Return formatted date for all other days
    return `on ${bookingDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        bookingDate.getFullYear() !== today.getFullYear()
          ? "numeric"
          : undefined,
    })}`;
  }
};

// Helper to get session status badge color
export function getSessionStatusColor(status: SessionStatus): string {
  switch (status) {
    case "UPCOMING":
      return "bg-blue-100 text-blue-800";
    case "IN_PROGRESS":
      return "bg-green-100 text-green-800";
    case "COMPLETED":
      return "bg-gray-100 text-gray-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Get the display status for a booking (combines payment + venue payment state)
 */
export function getDisplayStatus(booking: Booking): string {
  console.log("Booking: ", booking.require_deposit);

  // Deposit bookings - check venue payment state
  if (booking.status === "PAID" && booking.require_deposit) {
    console.log("IT booking deposit!");
    // Venue payment expired
    if (booking.venue_payment_expired) {
      return "PAYMENT EXPIRED";
    }

    // Venue payment completed
    if (booking.venue_payment_received) {
      return "PAID";
    }

    // Venue payment still pending
    return "DEPOSIT PAID";
  }

  // ADD REFUNDED STATUS FIRST
  if (booking.status === "REFUNDED") return "REFUNDED";

  // Expired bookings (online payment expired)
  if (booking.status === "EXPIRED") return "EXPIRED";

  // Cancelled bookings
  if (booking.status === "CANCELLED") return "CANCELLED";

  // Pending online payment
  if (booking.status === "PENDING") return "PENDING";

  // Full payment bookings (no deposit required)
  if (booking.status === "PAID" && !booking.require_deposit) {
    return "PAID";
  }

  // Fallback to original status
  return booking.status;
}

/**
 * Get badge styling for display status
 */
export function getDisplayStatusStyle(displayStatus: string): string {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-800",
    "DEPOSIT PAID": "bg-blue-100 text-blue-800",
    "PAYMENT EXPIRED": "bg-orange-100 text-orange-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
    EXPIRED: "bg-gray-100 text-gray-800",
    REFUNDED: "bg-purple-100 text-purple-800",
  };

  return styles[displayStatus] || "bg-gray-100 text-gray-800";
}

/**
 * Get icon component name for display status
 */
export function getDisplayStatusIcon(displayStatus: string): string {
  const icons: Record<string, string> = {
    PAID: "CheckCircle",
    "DEPOSIT PAID": "Clock",
    "PAYMENT EXPIRED": "AlertCircle",
    PENDING: "Clock",
    CANCELLED: "XCircle",
    EXPIRED: "XCircle",
    REFUNDED: "DollarSign",
  };

  return icons[displayStatus] || "Clock";
}

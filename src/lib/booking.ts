import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  LucideIcon,
  PlayCircle,
  Trophy,
} from "lucide-react";
import { Booking, VenuePaymentStatus } from "@/types/booking";

/*
 * Helper function to check if booking time has passed
 */
export function hasBookingTimePassed(booking: Booking): boolean {
  const bookingDate = new Date(booking.date);
  const timeEnd = booking.time.split(" - ")[1]; // "09:00 - 10:00" -> "10:00"
  const [hours, minutes] = timeEnd.split(":").map(Number);

  bookingDate.setHours(hours, minutes, 0, 0);

  return new Date() > bookingDate;
}

/*
 * Helper function to check if booking is currently active
 */
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

/*
 * Helper Format date relative to today
 */
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

/**
 * Check if payment URL is still valid (within 24 hours)
 */
export function isPaymentUrlValid(booking: Booking): boolean {
  if (!booking.payment_created_at) return false;

  const createdAt = new Date(booking.payment_created_at);
  const now = new Date();
  const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  return hoursElapsed < 24;
}

/**
 * Get hours remaining until payment expires
 */
export function getPaymentExpiryHours(booking: Booking): number {
  if (!booking.payment_created_at) return 0;

  const createdAt = new Date(booking.payment_created_at);
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // +24 hours
  const now = new Date();
  const hoursRemaining =
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  return Math.max(0, Math.ceil(hoursRemaining));
}

/**
 * Format payment expiry as human-readable string
 */
export function formatPaymentExpiry(booking: Booking): string {
  const hours = getPaymentExpiryHours(booking);

  if (hours === 0) return "Expired";
  if (hours === 1) return "Expires in 1 hour";
  if (hours < 24) return `Expires in ${hours} hours`;
  return "Expires in 24 hours";
}

/**
 * Helper function to determine venue payment status
 */
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

/**
 * Get session status badge color
 */
export function getSessionStatusColor(status: string): string {
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
 * Get icon component name for display status
 */
export function getSessionStatusIcon(status: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    UPCOMING: Clock,
    IN_PROGRESS: PlayCircle,
    COMPLETED: Trophy,
    CANCELLED: XCircle,
  };

  return icons[status] || Clock;
}

/**
 * Get the display status for a booking (combines payment + venue payment state)
 */
export function getDisplayStatus(booking: Booking): string {
  // ADD REFUNDED STATUS FIRST
  if (booking.status === "REFUNDED") return "REFUNDED";

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
export function getDisplayStatusIcon(displayStatus: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    PAID: CheckCircle,
    "DEPOSIT PAID": Clock,
    "PAYMENT EXPIRED": AlertCircle,
    PENDING: Clock,
    CANCELLED: XCircle,
    EXPIRED: XCircle,
    REFUNDED: DollarSign,
  };

  return icons[displayStatus] || Clock;
}

/**
 * Get formatted time display for multi-hour bookings
 */
export function getTimeDisplay(booking: Booking): string {
  return booking.time; // Already in "06:00 - 08:00" format
}

/**
 * Get duration label
 */
export function getDurationLabel(booking: Booking): string {
  if (booking.duration_hours === 1) {
    return "1 hour";
  }
  return `${booking.duration_hours} hours`;
}

/**
 * Get number of hours until booking starts
 */
export const getHoursUntilBooking = (booking: Booking): number => {
  const bookingDateTime = new Date(booking.date);
  const [hours, minutes, seconds] = booking.time_start.split(":").map(Number);

  bookingDateTime.setHours(hours, minutes, seconds || 0, 0);
  const diffInHours =
    (bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);

  return Math.round(diffInHours);
};

/**
 * Check if booking has expired (time has passed)
 */
export function isBookingExpired(booking: Booking): boolean {
  const bookingDate = new Date(booking.date);
  const [hours, minutes, seconds] = booking.time_end.split(":").map(Number);
  bookingDate.setHours(hours, minutes, seconds || 0, 0);
  return new Date() > bookingDate;
}

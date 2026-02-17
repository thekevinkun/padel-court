import { BookingStatus, SessionStatus } from "@/types/booking";

// Terminal states - these bookings should NEVER be modified by cron or webhooks
const TERMINAL_BOOKING_STATUSES: BookingStatus[] = [
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
];
const TERMINAL_SESSION_STATUSES: SessionStatus[] = ["COMPLETED", "CANCELLED"];

// Valid transitions map - based on your actual booking flow
const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["PAID", "CANCELLED", "EXPIRED"], // EXPIRED = payment window timed out
  PAID: ["CANCELLED", "REFUNDED"], // CANCELLED only via admin with refund flow
  CANCELLED: [], // Terminal
  EXPIRED: [], // Terminal
  REFUNDED: [], // Terminal
};

const VALID_SESSION_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  UPCOMING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [], // Terminal
  CANCELLED: [], // Terminal
};

export function canTransitionBookingStatus(
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  return VALID_BOOKING_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionSessionStatus(
  from: SessionStatus,
  to: SessionStatus,
): boolean {
  return VALID_SESSION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return TERMINAL_BOOKING_STATUSES.includes(status);
}

export function isTerminalSessionStatus(status: SessionStatus): boolean {
  return TERMINAL_SESSION_STATUSES.includes(status);
}

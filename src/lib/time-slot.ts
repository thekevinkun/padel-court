import { supabase } from "@/lib/supabase/client";
import { TimeSlot } from "@/types";

/**
 * Calculate actual availability for time slots based on:
 * 1. admin_blocked status
 * 2. Active bookings (PENDING, PAID with UPCOMING or IN_PROGRESS sessions)
 *
 * Returns slots with updated `is_booked` and `booking_count` fields
 */
export async function calculateTimeSlotAvailability(
  slots: TimeSlot[],
): Promise<TimeSlot[]> {
  if (slots.length === 0) return [];

  const slotIds = slots.map((s) => s.id);

  // Get all active bookings for these time slots
  // Active = PENDING or PAID, and session is not COMPLETED or CANCELLED
  const { data: bookingSlots, error } = await supabase
    .from("booking_time_slots")
    .select(
      `
      time_slot_id,
      bookings!inner (
        id,
        status,
        session_status
      )
    `,
    )
    .in("time_slot_id", slotIds)
    .in("bookings.status", ["PENDING", "PAID"])
    .not("bookings.session_status", "in", '("COMPLETED","CANCELLED")');

  if (error) {
    console.error("Error fetching booking slots:", error);
    // Fallback: use database values
    return slots.map((slot) => ({
      ...slot,
      is_booked: false,
      booking_count: 0,
    }));
  }

  // Count bookings per slot
  const bookingCountMap = new Map<string, number>();
  (bookingSlots || []).forEach((bs) => {
    const count = bookingCountMap.get(bs.time_slot_id) || 0;
    bookingCountMap.set(bs.time_slot_id, count + 1);
  });

  // Enrich slots with booking info
  return slots.map((slot) => {
    const bookingCount = bookingCountMap.get(slot.id) || 0;
    const isBooked = bookingCount > 0;

    return {
      ...slot,
      is_booked: isBooked,
      booking_count: bookingCount,
    };
  });
}

/**
 * Check if a specific time slot can be modified by admin
 * Returns: { canModify: boolean, reason?: string }
 */
export async function canAdminModifySlot(slotId: string): Promise<{
  canModify: boolean;
  reason?: string;
}> {
  // Check for active bookings
  const { data: bookings, error } = await supabase
    .from("booking_time_slots")
    .select(
      `
      id,
      bookings!inner (
        id,
        status,
        session_status,
        customer_name,
        booking_ref
      )
    `,
    )
    .eq("time_slot_id", slotId)
    .in("bookings.status", ["PENDING", "PAID"])
    .not("bookings.session_status", "in", '("COMPLETED","CANCELLED")');

  if (error) {
    console.error("Error checking bookings:", error);
    return { canModify: false, reason: "Database error" };
  }

  if (bookings && bookings.length > 0) {
    const bookingRefs = bookings
      .map((b: any) => b.bookings?.booking_ref)
      .filter(Boolean)
      .join(", ");

    return {
      canModify: false,
      reason: `Active booking(s) exist: ${bookingRefs || `${bookings.length} booking(s)`}. Cancel the booking(s) first.`,
    };
  }

  return { canModify: true };
}

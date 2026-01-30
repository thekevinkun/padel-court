import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Booking } from "@/types/booking";
import { supabase } from "@/lib/supabase/client";
import { formatRelativeDate } from "@/lib/booking";

export function useRealtimeBookings(initialBookings: Booking[] = []) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const lastEventRef = useRef<{
    id: string;
    timestamp: number;
    type: string;
  } | null>(null);

  // Update bookings when initialBookings change (from refetch)
  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("bookings_realtime_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        async (payload) => {
          const newBooking = payload.new as Booking;

          console.log("📅 New booking received:", newBooking);

          // Fetch complete booking data with relations
          const { data: completeBooking } = await supabase
            .from("bookings")
            .select(
              `
    *,
    courts(id, name, description, available),
    booking_time_slots(
      id,
      time_slots(time_start, time_end)
    ),
    booking_equipment(
      id,
      quantity,
      equipment(name)
    ),
    booking_players(
      id,
      player_name,
      is_primary_booker
    )
  `,
            )
            .eq("id", newBooking.id)
            .single();

          if (completeBooking) {
            // Add to top of list
            setBookings((prev) => [completeBooking, ...prev]);

            // Format description with relative date and time
            const relativeDate = formatRelativeDate(completeBooking.date);
            const courtName = completeBooking.courts?.name || "a court";

            // Show toast notification (stays until closed)
            toast.success("New Booking Received! 🎉", {
              description: `${completeBooking.customer_name} booked ${courtName} for ${relativeDate} at ${completeBooking.time}`,
              duration: Infinity,
              action: {
                label: "View",
                onClick: () => {
                  window.location.href = `/admin/bookings/${completeBooking.id}`;
                },
              },
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
        },
        async (payload) => {
          const updatedBooking = payload.new as Booking;
          const oldBooking = payload.old as Booking;

          console.log("📅 Booking updated:", updatedBooking);

          // Better debouncing - check BEFORE doing anything
          const now = Date.now();
          const bookingId = updatedBooking.id;

          // Create unique key based on actual changes
          const statusChanged = oldBooking.status !== updatedBooking.status;
          const sessionStatusChanged =
            oldBooking.session_status !== updatedBooking.session_status;
          const venuePaymentChanged =
            oldBooking.venue_payment_received !==
            updatedBooking.venue_payment_received;

          const eventKey = `${bookingId}-${oldBooking.status}-${updatedBooking.status}-${oldBooking.session_status}-${updatedBooking.session_status}`;

          if (
            lastEventRef.current?.type === eventKey &&
            now - lastEventRef.current.timestamp < 1000 // 1 second
          ) {
            console.log("📅 Duplicate event ignored (debounced)");
            return;
          }

          lastEventRef.current = {
            id: bookingId,
            timestamp: now,
            type: eventKey,
          };

          // Fetch complete booking data with relations
          const { data: completeBooking } = await supabase
            .from("bookings")
            .select(
              `
    *,
    courts(id, name, description, available),
    booking_time_slots(
      id,
      time_slots(time_start, time_end)
    ),
    booking_equipment(
      id,
      quantity,
      equipment(name)
    ),
    booking_players(
      id,
      player_name,
      is_primary_booker
    )
  `,
            )
            .eq("id", updatedBooking.id)
            .single();

          if (!completeBooking) return;

          // Show toasts OUTSIDE of setState to prevent duplicates

          // Payment status changed
          if (statusChanged && updatedBooking.status === "PAID") {
            const relativeDate = formatRelativeDate(completeBooking.date);
            toast.success("Payment Received! 💰", {
              description: `${completeBooking.customer_name}'s booking for ${relativeDate} at ${completeBooking.time} is confirmed`,
              duration: Infinity,
            });
          }
          // Booking cancelled
          else if (statusChanged && updatedBooking.status === "CANCELLED") {
            const relativeDate = formatRelativeDate(completeBooking.date);
            toast.error("Booking Cancelled", {
              description: `${completeBooking.customer_name}'s booking for ${relativeDate} at ${completeBooking.time} was cancelled`,
              duration: Infinity,
            });
          }

          // Session status: Check-in
          if (
            sessionStatusChanged &&
            updatedBooking.session_status === "IN_PROGRESS"
          ) {
            const courtName = completeBooking.courts?.name || "court";
            toast.info("Session Started! 🎾", {
              description: `${completeBooking.customer_name} checked in at ${courtName} for ${completeBooking.time}`,
              duration: Infinity,
            });
          }
          // Session status: Check-out
          else if (
            sessionStatusChanged &&
            updatedBooking.session_status === "COMPLETED"
          ) {
            toast.success("Session Completed! ✅", {
              description: `${completeBooking.customer_name} finished their session at ${completeBooking.time}`,
              duration: Infinity,
            });
          }

          // Venue payment received
          if (venuePaymentChanged && updatedBooking.venue_payment_received) {
            toast.success("Venue Payment Received! 💵", {
              description: `${
                completeBooking.customer_name
              } paid IDR ${completeBooking.venue_payment_amount.toLocaleString(
                "id-ID",
              )} remaining balance`,
              duration: Infinity,
            });
          }

          // Update in list (no toasts inside setState!)
          setBookings((currentBookings) =>
            currentBookings.map((booking) =>
              booking.id === completeBooking.id ? completeBooking : booking,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          const deletedId = payload.old.id;

          console.log("📅 Booking deleted:", deletedId);

          // Remove from list
          setBookings((prev) =>
            prev.filter((booking) => booking.id !== deletedId),
          );

          toast.info("Booking Deleted", {
            description: "A booking was removed from the system",
            duration: Infinity,
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsSubscribed(true);
          console.log("✅ Real-time bookings subscription active");
        } else if (status === "CLOSED") {
          setIsSubscribed(false);
          console.log("❌ Real-time bookings subscription closed");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Real-time bookings subscription error");
        }
      });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, []);

  return {
    bookings,
    isSubscribed,
  };
}

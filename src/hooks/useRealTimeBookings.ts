import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Booking } from "@/types/booking";

export function useRealtimeBookings(initialBookings: Booking[] = []) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isSubscribed, setIsSubscribed] = useState(false);

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
            .select("*, courts(id, name, description, available)")
            .eq("id", newBooking.id)
            .single();

          if (completeBooking) {
            // Add to top of list
            setBookings((prev) => [completeBooking, ...prev]);

            // Show toast notification (stays until closed)
            toast.success("New Booking Received! 🎉", {
              description: `${completeBooking.customer_name} booked ${
                completeBooking.courts?.name || "a court"
              }`,
              duration: Infinity, // Stays until manually closed
              action: {
                label: "View",
                onClick: () => {
                  window.location.href = `/admin/bookings/${completeBooking.id}`;
                },
              },
            });
          }
        }
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

          console.log("📅 Booking updated:", updatedBooking);

          // Fetch complete booking data with relations
          const { data: completeBooking } = await supabase
            .from("bookings")
            .select("*, courts(id, name, description, available)")
            .eq("id", updatedBooking.id)
            .single();

          if (completeBooking) {
            // Get old booking for comparison
            setBookings((currentBookings) => {
              const oldBooking = currentBookings.find(
                (b) => b.id === updatedBooking.id
              );

              // Show toast for important status changes
              if (oldBooking?.status !== updatedBooking.status) {
                if (updatedBooking.status === "PAID") {
                  toast.success("Payment Received! 💰", {
                    description: `${completeBooking.customer_name}'s booking is now confirmed`,
                    duration: Infinity,
                  });
                } else if (updatedBooking.status === "CANCELLED") {
                  toast.error("Booking Cancelled", {
                    description: `${completeBooking.customer_name}'s booking was cancelled`,
                    duration: Infinity,
                  });
                }
              }

              // Show toast for session status changes
              if (
                oldBooking?.session_status !== updatedBooking.session_status
              ) {
                if (updatedBooking.session_status === "IN_PROGRESS") {
                  toast.info("Session Started! 🎾", {
                    description: `${completeBooking.customer_name} checked in at ${completeBooking.courts?.name}`,
                    duration: Infinity,
                  });
                } else if (updatedBooking.session_status === "COMPLETED") {
                  toast.success("Session Completed! ✅", {
                    description: `${completeBooking.customer_name} finished their session`,
                    duration: Infinity,
                  });
                }
              }

              // Show toast for venue payment received
              if (
                oldBooking &&
                !oldBooking.venue_payment_received &&
                updatedBooking.venue_payment_received
              ) {
                toast.success("Venue Payment Received! 💵", {
                  description: `${completeBooking.customer_name} paid the remaining balance`,
                  duration: Infinity,
                });
              }

              // Update in list
              return currentBookings.map((booking) =>
                booking.id === completeBooking.id ? completeBooking : booking
              );
            });
          }
        }
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
            prev.filter((booking) => booking.id !== deletedId)
          );

          toast.info("Booking Deleted", {
            description: "A booking was removed from the system",
            duration: Infinity,
          });
        }
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

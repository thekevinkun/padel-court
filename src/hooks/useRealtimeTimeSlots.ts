import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { TimeSlot } from "@/types";
import { supabase } from "@/lib/supabase/client";

export function useRealtimeTimeSlots({
  courtId,
  date,
  enabled = true,
}: {
  courtId: string;
  date: string;
  enabled?: boolean;
}) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch time slots for the given court and date
  const fetchTimeSlots = useCallback(async () => {
    if (!courtId || !date) return;

    try {
      setLoading(true);

      // Fetch time slots
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("court_id", courtId)
        .eq("date", date)
        .order("time_start");

      if (error) throw error;

      // Use helper to calculate availability based on bookings
      const { calculateTimeSlotAvailability } = await import("@/lib/time-slot");
      const slotsWithBookingInfo = await calculateTimeSlotAvailability(
        data || [],
      );

      setTimeSlots(slotsWithBookingInfo);
      console.log(
        `📅 Fetched ${slotsWithBookingInfo.length} time slots for ${date}`,
      );
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast.error("Failed to load time slots.");
    } finally {
      setLoading(false);
    }
  }, [courtId, date]);

  // Initial fetch
  useEffect(() => {
    if (enabled && courtId && date) {
      fetchTimeSlots();
    }
  }, [fetchTimeSlots, enabled, courtId, date]);

  // Real-time subscription
  useEffect(() => {
    if (!enabled || !courtId || !date) return;

    console.log("🔌 Setting up time slots real-time subscription...");

    const channel = supabase
      .channel("time_slots_realtime_channel")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "time_slots",
          filter: `court_id=eq.${courtId}`,
        },
        (payload) => {
          console.log("📅 Time slot changed:", payload);

          const changedSlot = payload.new as TimeSlot;

          // Only process if it's for the current date
          if (changedSlot?.date !== date && payload.eventType !== "DELETE") {
            return;
          }

          if (payload.eventType === "INSERT") {
            // Re-fetch to get proper availability calculation
            fetchTimeSlots();
            toast.info("New time slot added", {
              description: `${changedSlot.time_start.substring(0, 5)} - ${changedSlot.time_end.substring(0, 5)}`,
            });
          } else if (payload.eventType === "UPDATE") {
            // Re-fetch to recalculate availability properly
            fetchTimeSlots();

            const oldSlot = payload.old as TimeSlot;

            // Check what changed
            const adminBlockChanged =
              oldSlot?.admin_blocked !== changedSlot.admin_blocked;
            const priceChanged =
              oldSlot?.price_per_person !== changedSlot.price_per_person;

            // Build changes array
            const changes: string[] = [];
            if (adminBlockChanged) {
              changes.push(
                changedSlot.admin_blocked ? "Admin blocked" : "Admin unblocked",
              );
            }
            if (priceChanged) {
              changes.push(
                `Price: IDR ${changedSlot.price_per_person.toLocaleString("id-ID")}`,
              );
            }

            // Show toast if something changed
            if (changes.length > 0) {
              let title: string;
              let toastType: "success" | "info";

              if (adminBlockChanged && priceChanged) {
                title = changedSlot.admin_blocked
                  ? "🔒 Slot blocked & updated"
                  : "⏰ Slot unblocked & updated";
                toastType = changedSlot.admin_blocked ? "info" : "success";
              } else if (adminBlockChanged) {
                title = changedSlot.admin_blocked
                  ? "🔒 Admin blocked slot"
                  : "⏰ Admin unblocked slot";
                toastType = changedSlot.admin_blocked ? "info" : "success";
              } else {
                title = "💰 Time slot updated";
                toastType = "info";
              }

              const description = `${changedSlot.time_start.substring(0, 5)} • ${changes.join(" • ")}`;

              if (toastType === "success") {
                toast.success(title, { description });
              } else {
                toast.info(title, { description });
              }
            }
          } else if (payload.eventType === "DELETE") {
            // Slot deleted
            const deletedId = payload.old.id as string;

            setTimeSlots((prev) =>
              prev.filter((slot) => slot.id !== deletedId),
            );

            toast.info("Time slot removed", {
              description: "A time slot was deleted",
            });
          }
        },
      )
      .subscribe((status) => {
        console.log("📅 Time slots subscription status:", status);
        setIsSubscribed(status === "SUBSCRIBED");
      });

    // Cleanup
    return () => {
      console.log("📅 Cleaning up time slots subscription");
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [enabled, courtId, date]);

  return {
    timeSlots,
    loading,
    isSubscribed,
    refetch: fetchTimeSlots,
  };
}

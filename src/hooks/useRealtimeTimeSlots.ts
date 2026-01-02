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

      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("court_id", courtId)
        .eq("date", date)
        .order("time_start");

      if (error) throw error;

      setTimeSlots(data || []);
      console.log(`📅 Fetched ${data?.length || 0} time slots for ${date}`);
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
            // New slot added
            setTimeSlots((prev) => {
              // Check if already exists
              if (prev.some((s) => s.id === changedSlot.id)) return prev;

              const updated = [...prev, changedSlot].sort((a, b) =>
                a.time_start.localeCompare(b.time_start)
              );
              return updated;
            });

            toast.info("New time slot added", {
              description: `${changedSlot.time_start.substring(
                0,
                5
              )} - ${changedSlot.time_end.substring(0, 5)}`,
            });
          } else if (payload.eventType === "UPDATE") {
            // Slot updated
            const oldSlot = payload.old as TimeSlot;

            setTimeSlots((prev) =>
              prev.map((slot) =>
                slot.id === changedSlot.id ? changedSlot : slot
              )
            );

            // Debug logs
            console.log("🔍 UPDATE detected:");
            console.log("  Old available:", oldSlot?.available);
            console.log("  New available:", changedSlot.available);
            console.log("  Old price:", oldSlot?.price_per_person);
            console.log("  New price:", changedSlot.price_per_person);

            // Check what changed
            const availabilityChanged =
              oldSlot?.available !== changedSlot.available;
            const priceChanged =
              oldSlot?.price_per_person !== changedSlot.price_per_person;

            console.log("  Availability changed?", availabilityChanged);
            console.log("  Price changed?", priceChanged);

            // Build changes array for description
            const changes: string[] = [];

            if (availabilityChanged) {
              changes.push(
                changedSlot.available ? "Now available" : "Now blocked"
              );
            }

            if (priceChanged) {
              changes.push(
                `Price: IDR ${changedSlot.price_per_person.toLocaleString(
                  "id-ID"
                )}`
              );
            }

            // Only show toast if something actually changed
            if (changes.length > 0) {
              // Prioritize price change message if only price changed
              let title: string;
              let toastType: "success" | "info";

              if (availabilityChanged && priceChanged) {
                // Both changed
                title = changedSlot.available
                  ? "⏰ Time slot unblocked"
                  : "🔒 Time slot blocked";
                toastType = changedSlot.available ? "success" : "info";
              } else if (availabilityChanged) {
                // Only availability changed
                title = changedSlot.available
                  ? "⏰ Time slot unblocked"
                  : "🔒 Time slot blocked";
                toastType = changedSlot.available ? "success" : "info";
              } else {
                // Only price changed (or other fields)
                title = "💰 Time slot updated";
                toastType = "info";
              }

              const description = `${changedSlot.time_start.substring(
                0,
                5
              )} • ${changes.join(" • ")}`;

              console.log("  Showing toast:", title);
              console.log("  Description:", description);

              // Use appropriate toast type
              if (toastType === "success") {
                toast.success(title, { description });
              } else {
                toast.info(title, { description });
              }
            } else {
              console.log("  No changes detected, skipping toast");
            }
          } else if (payload.eventType === "DELETE") {
            // Slot deleted
            const deletedId = payload.old.id as string;

            setTimeSlots((prev) =>
              prev.filter((slot) => slot.id !== deletedId)
            );

            toast.info("Time slot removed", {
              description: "A time slot was deleted",
            });
          }
        }
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

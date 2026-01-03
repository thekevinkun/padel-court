// /src/hooks/useRealtimeFinancials.ts

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { AnalyticsData } from "@/types/reports";

interface UseRealtimeFinancialsProps {
  startDate: string;
  endDate: string;
  period?: string;
  enabled?: boolean;
  onDataUpdate?: (data: AnalyticsData) => void;
}

export function useRealtimeFinancials({
  startDate,
  endDate,
  period = "day",
  enabled = true,
  onDataUpdate,
}: UseRealtimeFinancialsProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const lastEventTimeRef = useRef<number>(0);

  // Use refs to always have latest values in the callback
  const startDateRef = useRef(startDate);
  const endDateRef = useRef(endDate);
  const periodRef = useRef(period);
  const onDataUpdateRef = useRef(onDataUpdate);

  // Update refs when props change
  useEffect(() => {
    startDateRef.current = startDate;
    endDateRef.current = endDate;
    periodRef.current = period;
    onDataUpdateRef.current = onDataUpdate;
  }, [startDate, endDate, period, onDataUpdate]);

  const refetchData = useCallback(async () => {
    try {
      console.log("📊 Fetching updated analytics data...");
      console.log("📊 Date range:", {
        startDate: startDateRef.current,
        endDate: endDateRef.current,
        period: periodRef.current,
      });

      const response = await fetch(
        `/api/reports/analytics?startDate=${startDateRef.current}&endDate=${endDateRef.current}&period=${periodRef.current}`
      );

      if (!response.ok) {
        console.error("📊 API response not OK:", response.status);
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      console.log(
        "📊 Received new data - Total Revenue:",
        data.summary.totalRevenue
      );

      // Update timestamp
      setLastUpdate(new Date());

      // Call the callback with new data
      if (onDataUpdateRef.current) {
        console.log("📊 Calling onDataUpdate callback");
        onDataUpdateRef.current(data);
      } else {
        console.warn("📊 No onDataUpdate callback provided!");
      }

      console.log("📊 Analytics data updated successfully ✅");
    } catch (error) {
      console.error("📊 Error refreshing analytics:", error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      console.log("📊 Real-time disabled, skipping subscription");
      return;
    }

    console.log("📊 Setting up real-time financials subscription");

    // Subscribe to bookings table changes
    const channel = supabase
      .channel("financial_reports_channel")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "bookings",
        },
        async (payload) => {
          console.log("📊 ========================================");
          console.log("📊 Booking change detected!");
          console.log("📊 Event type:", payload.eventType);
          console.log("📊 Payload:", payload);

          // Debouncing: Ignore events within 1 second
          const now = Date.now();
          if (now - lastEventTimeRef.current < 1000) {
            console.log(
              "📊 Event too soon after last one, ignoring (debounce)"
            );
            return;
          }
          lastEventTimeRef.current = now;

          // Get booking date from payload (type-safe)
          const newRecord = payload.new as Record<string, any> | null;
          const oldRecord = payload.old as Record<string, any> | null;
          const bookingDate = newRecord?.date || oldRecord?.date;

          console.log("📊 Booking date:", bookingDate);
          console.log(
            "📊 Current date range:",
            startDateRef.current,
            "to",
            endDateRef.current
          );

          if (!bookingDate) {
            console.log("📊 No booking date found in payload, skipping");
            return;
          }

          // Check if booking is within date range
          if (
            bookingDate >= startDateRef.current &&
            bookingDate <= endDateRef.current
          ) {
            console.log("📊 ✅ Booking is within date range!");
            console.log("📊 Triggering data refresh...");
            await refetchData();
          } else {
            console.log(
              "📊 ❌ Booking is outside date range, skipping refresh"
            );
          }
          console.log("📊 ========================================");
        }
      )
      .subscribe((status) => {
        console.log("📊 Financial reports subscription status:", status);
        setIsSubscribed(status === "SUBSCRIBED");
      });

    // Cleanup
    return () => {
      console.log("📊 Cleaning up financial reports subscription");
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [enabled, refetchData]); // Only depend on enabled and refetchData

  return {
    isSubscribed,
    lastUpdate,
    refetch: refetchData,
  };
}

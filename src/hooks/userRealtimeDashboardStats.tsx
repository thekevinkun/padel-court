import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { DashboardStats } from "@/types";
import { Booking } from "@/types/booking";
import { supabase } from "@/lib/supabase/client";

export function useRealtimeDashboardStats(
  initialStats: DashboardStats,
  onStatsUpdate: (stats: DashboardStats) => void,
  onRecentBookingsUpdate: (bookings: Booking[]) => void,
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const lastEventRef = useRef<{ id: string; timestamp: number } | null>(null);

  useEffect(() => {
    console.log("📊 Setting up real-time dashboard stats subscription...");

    const channel = supabase
      .channel("dashboard_stats_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        async (payload) => {
          console.log("📊 Booking change detected:", payload.eventType);

          // Prevent duplicate events (debounce within 1 second)
          const now = Date.now();
          const bookingId =
            (payload.new as { id?: string })?.id ??
            (payload.old as { id?: string })?.id;

          if (!bookingId) {
            console.warn("⚠️ Booking event without ID, ignored");
            return;
          }

          if (
            lastEventRef.current &&
            lastEventRef.current.id === bookingId &&
            now - lastEventRef.current.timestamp < 1000
          ) {
            console.log("📊 Duplicate event ignored (debounced)");
            return;
          }
          lastEventRef.current = { id: bookingId, timestamp: now };

          // Recalculate stats + recent bookings
          await recalculateAll();

          // Show contextual toasts
          if (payload.eventType === "INSERT") {
            const newBooking = payload.new as { customer_name: string };
            toast.success("📈 Dashboard Updated", {
              description: `New booking from ${newBooking.customer_name}`,
              duration: Infinity,
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedBooking = payload.new as {
              customer_name: string;
              status: string;
              session_status: string;
            };
            const oldBooking = payload.old as {
              status: string;
              session_status: string;
            };

            const statusChanged = oldBooking.status !== updatedBooking.status;
            const sessionStatusChanged =
              oldBooking.session_status !== updatedBooking.session_status;

            // Format session status for display
            const formatStatus = (status: string) =>
              status?.replace(/_/g, " ") || "UNKNOWN";

            // Priority 1: Payment status changed
            if (statusChanged && updatedBooking.status === "PAID") {
              toast.success("💰 Payment Received", {
                description: "Booking payment confirmed",
                duration: Infinity,
              });
            }
            // Priority 2: Booking cancelled
            else if (statusChanged && updatedBooking.status === "CANCELLED") {
              toast.info("🚫 Booking Cancelled", {
                description: "Dashboard stats updated",
                duration: Infinity,
              });
            }
            // Priority 3: Session status changed (check-in/check-out only)
            else if (sessionStatusChanged) {
              const oldStatus = formatStatus(oldBooking.session_status);
              const newStatus = formatStatus(updatedBooking.session_status);

              // Check-in: UPCOMING → IN_PROGRESS
              if (
                oldBooking.session_status === "UPCOMING" &&
                updatedBooking.session_status === "IN_PROGRESS"
              ) {
                toast.info(`✅ ${updatedBooking.customer_name} Checked In`, {
                  description: `${oldStatus} → ${newStatus}`,
                  duration: Infinity,
                });
              }
              // Check-out: IN_PROGRESS → COMPLETED
              else if (
                oldBooking.session_status === "IN_PROGRESS" &&
                updatedBooking.session_status === "COMPLETED"
              ) {
                toast.success(
                  `🏁 ${updatedBooking.customer_name} Session's Completed`,
                  {
                    description: `${oldStatus} → ${newStatus}`,
                    duration: Infinity,
                  },
                );
              }
              // Ignore other session status transitions (e.g., UNKNOWN → UPCOMING)
            }
          }
        },
      )
      .subscribe((status) => {
        console.log("📊 Dashboard stats subscription status:", status);
        setIsSubscribed(status === "SUBSCRIBED");
      });

    // Recalculate all stats and recent bookings
    const recalculateAll = async () => {
      try {
        const now = new Date();
        const options = { timeZone: "Asia/Makassar" };
        const today = now.toLocaleDateString("en-CA", options);

        // Fetch today's bookings (EXCLUDE CANCELLED)
        const { data: todayData } = await supabase
          .from("bookings")
          .select(
            "total_amount, status, require_deposit, deposit_amount, subtotal, payment_fee, session_status, remaining_balance, full_amount, refund_status, refund_amount",
          )
          .eq("date", today)
          .neq("status", "CANCELLED"); // Exclude cancelled bookings

        // Revenue = actual booking revenue (including refunded)
        const todayRevenue =
          todayData?.reduce((sum, b) => {
            let bookingRevenue = 0;

            if (b.refund_status === "COMPLETED") {
              bookingRevenue = b.refund_amount;
            } else if (b.status === "PAID") {
              if (b.require_deposit && b.remaining_balance > 0) {
                bookingRevenue = b.deposit_amount;
              } else if (b.require_deposit && b.remaining_balance === 0) {
                bookingRevenue = b.full_amount;
              } else {
                bookingRevenue = b.subtotal;
              }
            }

            return sum + bookingRevenue;
          }, 0) ?? 0;

        // Count only non-refunded bookings
        const todayBookings =
          todayData?.filter((b) => b.status !== "REFUNDED").length || 0;

        // Fetch total bookings (EXCLUDE CANCELLED)
        const { count: totalBookings } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .neq("status", "CANCELLED");

        // Fetch available slots for today
        const { count: availableSlots } = await supabase
          .from("time_slots")
          .select("*", { count: "exact", head: true })
          .eq("date", today)
          .eq("available", true);

        // Fetch pending venue payments
        const { data: pendingPayments } = await supabase
          .from("bookings")
          .select("remaining_balance")
          .eq("status", "PAID")
          .eq("date", today)
          .eq("session_status", "UPCOMING")
          .eq("require_deposit", true)
          .eq("venue_payment_received", false)
          .eq("venue_payment_expired", false)
          .gt("remaining_balance", 0);

        const pendingVenuePayments = pendingPayments?.length || 0;
        const pendingVenueAmount =
          pendingPayments?.reduce((sum, b) => sum + b.remaining_balance, 0) ||
          0;

        // Fetch session stats (EXCLUDE CANCELLED)
        const { count: inProgressSessions } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("session_status", "IN_PROGRESS")
          .neq("status", "CANCELLED");

        const { count: upcomingSessions } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("session_status", "UPCOMING")
          .eq("status", "PAID")
          .eq("date", today);

        const { count: completedToday } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("session_status", "COMPLETED")
          .eq("date", today)
          .neq("status", "CANCELLED");

        // Fetch recent bookings
        const { data: recentBookings } = await supabase
          .from("bookings")
          .select(
            `
            *, 
            courts (name),
            booking_time_slots (
              id,
              time_slots (time_start, time_end)
            )
          `,
          )
          .eq("date", today)
          .order("created_at", { ascending: false })
          .limit(10);

        // Track refunds separately
        const todayRefundedBookings =
          todayData?.filter((b) => b.status === "REFUNDED").length || 0;
        const todayRefundAmount =
          todayData
            ?.filter((b) => b.status === "REFUNDED")
            .reduce((sum, b) => sum + (b.refund_amount || 0), 0) || 0;

        // Update stats
        const newStats: DashboardStats = {
          todayBookings,
          todayRevenue,
          totalBookings: totalBookings || 0,
          availableSlots: availableSlots || 0,
          pendingVenuePayments,
          pendingVenueAmount,
          inProgressSessions: inProgressSessions || 0,
          upcomingSessions: upcomingSessions || 0,
          completedToday: completedToday || 0,
          todayRefunds: todayRefundedBookings,
          todayRefundAmount,
        };

        onStatsUpdate(newStats);
        onRecentBookingsUpdate(recentBookings || []);
        console.log("📊 Stats + Recent bookings updated");
      } catch (error) {
        console.error("❌ Error recalculating dashboard data:", error);
      }
    };

    return () => {
      console.log("📊 Cleaning up dashboard stats subscription");
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, []);

  return { isSubscribed };
}

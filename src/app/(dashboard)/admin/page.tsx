"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  RefreshCw,
  XCircle,
  PlayCircle,
  Trophy,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// import RealtimeDiagnostic from "@/components/dashboard/RealTimeDiagnostics";

import { useRealtimeDashboardStats } from "@/hooks/userRealtimeDashboardStats";

import { DashboardStats } from "@/types";
import { Booking } from "@/types/booking";
import { supabase } from "@/lib/supabase/client";
import { getDisplayStatus } from "@/lib/booking";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    todayRevenue: 0,
    totalBookings: 0,
    availableSlots: 0,
    pendingVenuePayments: 0,
    pendingVenueAmount: 0,
    inProgressSessions: 0,
    upcomingSessions: 0,
    completedToday: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(true);

  // Real-time stats + recent bookings subscription
  const { isSubscribed } = useRealtimeDashboardStats(
    stats,
    (newStats) => setStats(newStats),
    (newBookings) => setRecentBookings(newBookings), // Pass recent bookings updater
  );

  useEffect(() => {
    const initializeDashboard = async () => {
      await triggerStatusUpdate();
      await fetchDashboardData();
    };
    initializeDashboard();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const options = { timeZone: "Asia/Makassar" };
      const today = now.toLocaleDateString("en-CA", options);

      // Fetch today's bookings (EXCLUDE CANCELLED)
      const { data: todayData } = await supabase
        .from("bookings")
        .select(
          "total_amount, status, require_deposit, deposit_amount, subtotal, payment_fee, session_status, refund_amount",
        )
        .eq("date", today)
        .neq("status", "CANCELLED"); // Exclude cancelled bookings

      // Revenue = actual booking revenue (excluding refunded)
      const todayRevenue =
        todayData
          ?.filter((b) => b.status === "PAID") // Only PAID, not REFUNDED
          .reduce((sum, b) => {
            const bookingRevenue = b.require_deposit
              ? b.deposit_amount
              : b.subtotal;
            return sum + bookingRevenue;
          }, 0) || 0;

      // Count only non-refunded bookings
      const todayBookings =
        todayData?.filter((b) => b.status !== "REFUNDED").length || 0;

      // Fetch total bookings (EXCLUDE CANCELLED)
      const { count: totalBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .neq("status", "CANCELLED"); // Exclude cancelled bookings

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
        .eq("require_deposit", true)
        .eq("venue_payment_received", false)
        .eq("venue_payment_expired", false)
        .gt("remaining_balance", 0);

      const pendingVenuePayments = pendingPayments?.length || 0;
      const pendingVenueAmount =
        pendingPayments?.reduce((sum, b) => sum + b.remaining_balance, 0) || 0;

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
      const { data: recent } = await supabase
        .from("bookings")
        .select(`*, courts (name)`)
        .order("created_at", { ascending: false })
        .limit(5);

      // Track refunds separately
      const todayRefundedBookings =
        todayData?.filter((b) => b.status === "REFUNDED").length || 0;
      const todayRefundAmount =
        todayData
          ?.filter((b) => b.status === "REFUNDED")
          .reduce((sum, b) => sum + (b.refund_amount || 0), 0) || 0;

      setStats({
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
      });
      setRecentBookings(recent || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setLoadingRefresh(false);
    }
  };

  const triggerStatusUpdate = async () => {
    try {
      const response = await fetch("/api/bookings/update-statuses", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Status update:", data);
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const statCards = [
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: "Total confirmed bookings",
    },
    {
      title: "Today's Revenue",
      value: `IDR ${stats.todayRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: "Total booking value (excl. fees)",
    },
    {
      title: "In Progress",
      value: stats.inProgressSessions,
      icon: PlayCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      subtitle: "Currently playing",
    },
    {
      title: "Upcoming Today",
      value: stats.upcomingSessions,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: "Waiting to check-in",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "Sessions finished",
    },
    {
      title: "Available Slots",
      value: stats.availableSlots,
      icon: Calendar,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      subtitle: "Remaining today",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message with Real-time Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-forest to-forest-dark text-white rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
            <p className="text-white/80">
              Here's what's happening with your padel courts today.
            </p>
            <div className="flex items-center gap-2 mt-3">
              {isSubscribed ? (
                <>
                  <Wifi className="w-4 h-4 text-green-300" />
                  <span className="text-xs text-green-300">
                    Live updates active
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-yellow-300">Connecting...</span>
                </>
              )}
            </div>
          </div>
          <Button
            onClick={async () => {
              setLoadingRefresh(true);
              await triggerStatusUpdate();
              await fetchDashboardData();
            }}
            variant="outline"
            className="hover:bg-gray-300"
            disabled={loadingRefresh}
          >
            <RefreshCw
              className={`text-accent-foreground !w-4.5 !h-4.5 ${
                loadingRefresh ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </motion.div>

      {/* Pending Venue Payments Alert */}
      {stats.pendingVenuePayments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Alert className="bg-orange-50 border-orange-200">
            <AlertDescription>
              <div className="flex items-center justify-between gap-5">
                <div>
                  <strong className="text-orange-900">
                    {stats.pendingVenuePayments} Booking
                    {stats.pendingVenuePayments > 1 ? "s" : ""} Awaiting Venue
                    Payment
                  </strong>
                  <p className="text-sm text-orange-700 mt-1">
                    Total to collect: IDR{" "}
                    {stats.pendingVenueAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                <Link href="/admin/bookings?filter=venue_pending">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-300 hover:bg-orange-100"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Stats Cards - Now with real-time updates! */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Bookings - Now updates in real-time! */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No bookings yet
              </p>
            ) : (
              recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          booking.session_status === "IN_PROGRESS"
                            ? "bg-green-100"
                            : booking.session_status === "COMPLETED"
                              ? "bg-gray-100"
                              : booking.session_status === "CANCELLED"
                                ? "bg-red-100"
                                : getDisplayStatus(booking) === "PAID"
                                  ? "bg-blue-100"
                                  : getDisplayStatus(booking) === "DEPOSIT PAID"
                                    ? "bg-orange-100"
                                    : "bg-yellow-100"
                        }`}
                      >
                        {booking.session_status === "IN_PROGRESS" ? (
                          <PlayCircle className="h-5 w-5 text-green-600" />
                        ) : booking.session_status === "COMPLETED" ? (
                          <CheckCircle className="h-5 w-5 text-gray-600" />
                        ) : booking.session_status === "CANCELLED" ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : getDisplayStatus(booking) === "PAID" ? (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        ) : getDisplayStatus(booking) === "DEPOSIT PAID" ? (
                          <Clock className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{booking.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.courts?.name} • {booking.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        IDR{" "}
                        {(booking.require_deposit
                          ? booking.deposit_amount
                          : booking.subtotal
                        ).toLocaleString("id-ID")}
                      </p>
                      {getDisplayStatus(booking) === "DEPOSIT PAID" && (
                        <p className="text-xs text-orange-600">
                          +{booking.remaining_balance.toLocaleString("id-ID")}{" "}
                          at venue
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {getDisplayStatus(booking)} •{" "}
                        {booking.session_status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Diagnostics */}
      {/* <RealtimeDiagnostic /> */}
    </div>
  );
}

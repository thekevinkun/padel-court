"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  BarChart3,
  XCircle,
  PlayCircle,
  Trophy,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// import RealtimeDiagnostic from "@/components/dashboard/RealTimeDiagnostics";

import { useRealtimeDashboardStats } from "@/hooks/useRealtimeDashboardStats";

import { DashboardStats } from "@/types";
import { Booking } from "@/types/booking";
import { supabase } from "@/lib/supabase/client";
import { formatRelativeDate, getDisplayStatus } from "@/lib/booking";

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
          "total_amount, status, require_deposit, deposit_amount, subtotal, payment_fee, session_status, remaining_balance, full_amount, refund_status, refund_amount",
        )
        .eq("date", today)
        .neq("status", "CANCELLED"); // Exclude cancelled bookings

      // Revenue = actual booking revenue (including refunded)
      const todayRevenue =
        todayData?.reduce((sum, b) => {
          let bookingRevenue = 0;

          if (b.refund_status === "COMPLETED") {
            const refundAmount = parseFloat(b.refund_amount || "0");
            const onlinePaid = b.require_deposit
              ? b.deposit_amount
              : b.total_amount;
            if (refundAmount >= onlinePaid) {
              bookingRevenue = 0;
            } else {
              bookingRevenue = b.refund_amount;
            }
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
        .eq("session_status", "UPCOMING")
        .eq("date", today)
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
    // Card 1: Right Now - What's Active
    {
      title: "Active Right Now",
      value: stats.inProgressSessions,
      icon: PlayCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      subtitle: `${stats.upcomingSessions} upcoming today`,
      description: "Currently playing sessions",
    },
    // Card 2: Today's Performance
    {
      title: "Today's Performance",
      value: `IDR ${stats.todayRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: `${stats.todayBookings} bookings`,
      description: "Revenue from confirmed bookings",
    },
    // Card 3: Alerts & Actions Needed
    {
      title: "Needs Attention",
      value: stats.pendingVenuePayments,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: `IDR ${stats.pendingVenueAmount.toLocaleString("id-ID")} to collect`,
      description: "Bookings awaiting venue payment",
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
        <div className="flex md:items-center justify-between">
          <div>
            <h2 className="heading-3 font-bold mb-2">Welcome back!</h2>
            <p className="text-sm sm:text-base text-white/80">
              Real-time overview of what's happening at your courts today
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-300" />
                    <span className="hidden sm:inline-block text-xs text-green-300">
                      Live updates active
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-yellow-300" />
                    <span className="hidden sm:inline-block  text-xs text-yellow-300">
                      Connecting...
                    </span>
                  </>
                )}
              </div>
              <div className="h-4 w-px bg-white/30"></div>
              <Link href="/admin/reports">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  📊 View Reports
                </Button>
              </Link>
            </div>
          </div>
          <Button
            onClick={async () => {
              setLoadingRefresh(true);
              await triggerStatusUpdate();
              await fetchDashboardData();
            }}
            variant="outline"
            className="text-accent-foreground hover:bg-gray-300"
            disabled={loadingRefresh}
          >
            <BarChart3 className="w-4 h-4 sm:mr-1" />
            Refresh
          </Button>
        </div>

        {/* Quick Actions Section*/}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/bookings?filter=upcoming">
              <Button
                className="w-full text-accent-foreground hover:bg-transparent hover:text-accent"
                variant="outline"
                size="lg"
                title="View all upcoming sessions ready for check-in"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In Customers
              </Button>
            </Link>
            <Link href="/admin/bookings?filter=venue_pending">
              <Button
                className="w-full text-accent-foreground hover:bg-transparent hover:text-accent"
                variant="outline"
                size="lg"
                title="View bookings with pending venue payments"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Process Venue Payments
              </Button>
            </Link>
            <Link href="/admin/time-slots">
              <Button
                className="w-full text-accent-foreground hover:bg-transparent hover:text-accent"
                variant="outline"
                size="lg"
                title="View and manage today's court time slots"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Today's Schedule
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Session Overview*/}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Today's Session Status
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PlayCircle className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {stats.inProgressSessions}
                  </span>
                </div>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">
                    {stats.upcomingSessions}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Upcoming</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">
                    {stats.completedToday}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Bookings - Now updates in real-time! */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Today's Sessions</CardTitle>
          <Link href="/admin/bookings">
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No bookings yet
              </p>
            ) : (
              recentBookings
                .slice(0, 5) // Limit to 5 sessions
                .map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="block"
                  >
                    <div
                      className="flex flex-wrap items-center sm:justify-between gap-2
                      p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            getDisplayStatus(booking) === "REFUNDED"
                              ? "bg-purple-100"
                              : booking.session_status === "IN_PROGRESS"
                                ? "bg-green-100"
                                : booking.session_status === "COMPLETED"
                                  ? "bg-gray-100"
                                  : booking.session_status === "CANCELLED"
                                    ? "bg-red-100"
                                    : getDisplayStatus(booking) === "PAID"
                                      ? "bg-blue-100"
                                      : getDisplayStatus(booking) ===
                                          "DEPOSIT PAID"
                                        ? "bg-orange-100"
                                        : "bg-yellow-100"
                          }`}
                        >
                          {getDisplayStatus(booking) === "REFUNDED" ? (
                            <DollarSign className="h-5 w-5 text-purple-600" />
                          ) : booking.session_status === "IN_PROGRESS" ? (
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
                          <p className="text-sm text-muted-foreground capitalize">
                            {booking.courts?.name} •{" "}
                            {formatRelativeDate(booking.date)} • {booking.time}
                            {booking.duration_hours > 1 && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                {booking.duration_hours}h
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="font-medium">
                          IDR{" "}
                          {(booking.require_deposit
                            ? booking.deposit_amount
                            : booking.subtotal
                          ).toLocaleString("id-ID")}
                        </p>

                        {booking.refund_status === "COMPLETED" ? (
                          <div className="text-xs text-orange-600 mt-1">
                            Refunded: IDR{" "}
                            {booking.refund_amount.toLocaleString("id-ID")}
                          </div>
                        ) : (
                          (booking.require_deposit ||
                            getDisplayStatus(booking) === "DEPOSIT PAID") && (
                            <p className="text-xs text-orange-600">
                              <span
                                className={`${booking.venue_payment_expired || booking.session_status === "CANCELLED" ? "line-through" : ""}`}
                              >
                                {booking.remaining_balance > 0
                                  ? "+" +
                                    booking.remaining_balance.toLocaleString(
                                      "id-ID",
                                    ) +
                                    " at venue"
                                  : "+" +
                                    booking.venue_payment_amount.toLocaleString(
                                      "id-ID",
                                    ) +
                                    " at venue"}
                              </span>{" "}
                              {booking.venue_payment_expired
                                ? "(Expired)"
                                : booking.session_status === "CANCELLED"
                                  ? "(Not collected)"
                                  : ""}
                            </p>
                          )
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

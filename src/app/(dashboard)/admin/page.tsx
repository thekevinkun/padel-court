"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, DollarSign, Clock, CheckCircle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayRevenue: 0,
    todayNetRevenue: 0,
    totalBookings: 0,
    availableSlots: 0,
    pendingVenuePayments: 0,
    pendingVenueAmount: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toLocaleDateString("en-CA");

      // Fetch today's bookings
      const { data: todayData } = await supabase
        .from("bookings")
        .select(
          "total_amount, status, require_deposit, deposit_amount, subtotal, payment_fee"
        )
        .eq("date", today);

      const todayBookings = todayData?.length || 0;

      // Revenue = actual booking revenue (excluding payment fees)
      const todayRevenue =
        todayData
          ?.filter((b) => b.status === "PAID")
          .reduce((sum, b) => {
            const bookingRevenue = b.require_deposit
              ? b.deposit_amount
              : b.subtotal;
            return sum + bookingRevenue;
          }, 0) || 0;

      // Net revenue (what you actually received after Midtrans fees)
      const todayNetRevenue =
        todayData
          ?.filter((b) => b.status === "PAID")
          .reduce((sum, b) => {
            const netAmount = b.total_amount - b.payment_fee;
            return sum + netAmount;
          }, 0) || 0;

      // Fetch total bookings
      const { count: totalBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      // Fetch available slots for today
      const { count: availableSlots } = await supabase
        .from("time_slots")
        .select("*", { count: "exact", head: true })
        .eq("date", today)
        .eq("available", true);

      // Fetch pending venue payments (all bookings, not just today)
      const { data: pendingPayments } = await supabase
        .from("bookings")
        .select("remaining_balance")
        .eq("status", "PAID")
        .eq("require_deposit", true)
        .eq("venue_payment_received", false)
        .gt("remaining_balance", 0);

      const pendingVenuePayments = pendingPayments?.length || 0;
      const pendingVenueAmount =
        pendingPayments?.reduce((sum, b) => sum + b.remaining_balance, 0) || 0;

      // Fetch recent bookings
      const { data: recent } = await supabase
        .from("bookings")
        .select(`*, courts (name)`)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        todayBookings,
        todayRevenue,
        todayNetRevenue,
        totalBookings: totalBookings || 0,
        availableSlots: availableSlots || 0,
        pendingVenuePayments,
        pendingVenueAmount,
      });
      setRecentBookings(recent || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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
      title: "Net Received",
      value: `IDR ${stats.todayNetRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      subtitle: "After Midtrans fees",
    },
    {
      title: "Available Slots",
      value: stats.availableSlots,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
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
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-forest to-forest-dark text-white rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-white/80">
          Here's what's happening with your padel courts today.
        </p>
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
                    ⚠️ {stats.pendingVenuePayments} Booking
                    {stats.pendingVenuePayments > 1 ? "s" : ""} Awaiting Venue
                    Payment
                  </strong>
                  <p className="text-sm text-orange-700 mt-1">
                    Total to collect: IDR{" "}
                    {stats.pendingVenueAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                <Link href="/admin/bookings">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Recent Bookings */}
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
                          booking.status === "PAID"
                            ? "bg-green-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        {booking.status === "PAID" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
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
                      {booking.require_deposit &&
                        booking.remaining_balance > 0 && (
                          <p className="text-xs text-orange-600">
                            +{booking.remaining_balance.toLocaleString("id-ID")}{" "}
                            at venue
                          </p>
                        )}
                      <p
                        className={`text-sm ${
                          booking.status === "PAID"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {booking.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

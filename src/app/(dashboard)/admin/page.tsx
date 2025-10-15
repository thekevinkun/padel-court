"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayRevenue: 0,
    totalBookings: 0,
    availableSlots: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get today's date
      const today = new Date().toISOString().split("T")[0];

      // Fetch today's bookings
      const { data: todayData } = await supabase
        .from("bookings")
        .select("total_amount, status")
        .eq("date", today);

      // Calculate today's stats
      const todayBookings = todayData?.length || 0;
      const todayRevenue =
        todayData
          ?.filter((b) => b.status === "PAID")
          .reduce((sum, b) => sum + b.total_amount, 0) || 0;

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

      // Fetch recent bookings
      const { data: recent } = await supabase
        .from("bookings")
        .select(
          `
          *,
          courts (name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        todayBookings,
        todayRevenue,
        totalBookings: totalBookings || 0,
        availableSlots: availableSlots || 0,
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
    },
    {
      title: "Today's Revenue",
      value: `IDR ${stats.todayRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Available Slots",
      value: stats.availableSlots,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
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
        <h2 className="text-2xl font-bold mb-2">Welcome back! 👋</h2>
        <p className="text-white/80">
          Here's what's happening with your padel courts today.
        </p>
      </motion.div>

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
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
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
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
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
                      IDR {booking.total_amount.toLocaleString("id-ID")}
                    </p>
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

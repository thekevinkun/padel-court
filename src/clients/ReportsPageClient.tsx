"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  BarChart3,
  Clock,
  TrendingDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import RevenueChart from "@/components/dashboard/RevenueChart";
import TopCourtsChart from "@/components/dashboard/TopCourtsChart";
import PaymentMethodChart from "@/components/dashboard/PaymentMethodChart";

import { useRealtimeFinancials } from "@/hooks/useRealtimeFinancials";
import { AnalyticsData } from "@/types/reports";

const ReportsPageClient = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Date range state
  const [dateRange, setDateRange] = useState<string>("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const getDateRange = () => {
    const today = new Date();
    let startDate = "";
    let endDate = today.toLocaleDateString("en-CA");

    switch (dateRange) {
      case "today":
        startDate = endDate;
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toLocaleDateString("en-CA");
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toLocaleDateString("en-CA");
        break;
      case "year":
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        startDate = yearAgo.toLocaleDateString("en-CA");
        break;
      case "custom":
        startDate = customStartDate || endDate;
        endDate = customEndDate || endDate;
        break;
      default:
        startDate = endDate;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Real-time subscription
  const { isSubscribed, lastUpdate } = useRealtimeFinancials({
    startDate,
    endDate,
    period: dateRange,
    enabled: !loading && !!analytics, // Only enable after initial load
    onDataUpdate: (newData) => {
      console.log("📊 ReportsPageClient: Received new data from hook");
      console.log("📊 New summary:", newData.summary);
      setAnalytics(newData);
    },
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      const response = await fetch(
        `/api/reports/analytics?startDate=${startDate}&endDate=${endDate}&period=${dateRange}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
      console.log("📊 Analytics data loaded successfully");
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const headers = [
      "Date",
      "Online Revenue",
      "Venue Revenue",
      "Total Revenue",
      "Net Revenue",
      "Fees Absorbed",
    ];
    const rows = analytics.revenueTimeline.map((item) => [
      item.date,
      item.onlineRevenue,
      item.venueRevenue,
      item.totalRevenue,
      item.netRevenue,
      item.feesAbsorbed,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-report-${analytics.startDate}-to-${analytics.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Revenue",
      value: `IDR ${analytics.summary.totalRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: "Actual booking value",
    },
    {
      title: "Net Revenue",
      value: `IDR ${analytics.summary.netRevenue.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      subtitle: "After payment fees",
    },
    {
      title: "Online Revenue",
      value: `IDR ${analytics.summary.onlineRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: "Deposits + full payments",
    },
    {
      title: "Venue Revenue",
      value: `IDR ${analytics.summary.venueRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "Cash collected at venue",
    },
    {
      title: "Total Bookings",
      value: analytics.summary.totalBookings,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: `Avg: IDR ${Math.round(
        analytics.summary.averageBookingValue
      ).toLocaleString("id-ID")}`,
    },
    {
      title: "Fees Absorbed",
      value: `IDR ${analytics.summary.totalFeesAbsorbed.toLocaleString(
        "id-ID"
      )}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
      subtitle: "Midtrans processing fees",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Connection Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSubscribed ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Live updates active</span>
              {lastUpdate && (
                <span className="text-xs">
                  • Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-400" />
              <span>Real-time disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label>📅 Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="flex-1">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="flex-1">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </>
            )}

            <div className="flex items-end gap-2">
              <Button onClick={fetchAnalytics} className="w-full lg:w-auto">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing data from{" "}
            <strong>
              {new Date(analytics.startDate).toLocaleDateString("id-ID")}
            </strong>{" "}
            to{" "}
            <strong>
              {new Date(analytics.endDate).toLocaleDateString("id-ID")}
            </strong>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {card.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={analytics.revenueTimeline} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.revenueTimeline.map((item) => (
                  <div
                    key={item.date}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(item.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-blue-600">
                          Online: IDR{" "}
                          {item.onlineRevenue.toLocaleString("id-ID")}
                        </span>
                        <span className="text-purple-600">
                          Venue: IDR {item.venueRevenue.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-xl">
                        IDR {item.totalRevenue.toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-emerald-600">
                        Net: IDR {item.netRevenue.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        Fees: IDR {item.feesAbsorbed.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodChart data={analytics.paymentMethods} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courts</CardTitle>
            </CardHeader>
            <CardContent>
              <TopCourtsChart data={analytics.topCourts} />
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock className="w-5 h-5 inline mr-2" />
                Peak Hours Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.peakHours.slice(0, 10).map((hour, index) => (
                  <div
                    key={hour.hour}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-forest">
                          #{index + 1}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {hour.hour}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-forest h-3 rounded-full"
                          style={{
                            width: `${
                              (hour.bookings /
                                analytics.peakHours[0].bookings) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-forest w-12 text-right">
                        {hour.bookings}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPageClient;

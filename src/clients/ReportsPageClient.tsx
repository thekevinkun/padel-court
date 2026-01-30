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
  Info,
  CheckCircle,
  XCircle,
  Banknote,
  CreditCard,
  Wallet,
  Receipt,
  Trophy,
  Users,
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
import RevenueChart from "@/components/dashboard/RevenueChart";
import TopCourtsChart from "@/components/dashboard/TopCourtsChart";
import PaymentMethodChart from "@/components/dashboard/PaymentMethodChart";

import { useRealtimeFinancials } from "@/hooks/useRealtimeFinancials";
import { AnalyticsData } from "@/types/reports";

const InfoTooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <Info
        className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute z-50 w-64 p-3 text-xs bg-gray-900 text-white rounded-lg shadow-xl -top-2 left-6 pointer-events-none">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-forest/10 rounded-lg">
        <Icon className="w-6 h-6 text-forest" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
};

const ChartSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="h-96 bg-gray-200 rounded-lg"></div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

const ReportsPageClient = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // For progressive chart loading
  const [chartsLoaded, setChartsLoaded] = useState({
    revenueTimeline: false,
    paymentMethods: false,
    topCourts: false,
    peakHours: false,
  });

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
  useRealtimeFinancials({
    startDate,
    endDate,
    period: dateRange,
    enabled: !loading && !!analytics,
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

      // Reset charts loaded state
      setChartsLoaded({
        revenueTimeline: false,
        paymentMethods: false,
        topCourts: false,
        peakHours: false,
      });

      // Fetch analytics data by date range
      const { startDate, endDate } = getDateRange();
      const response = await fetch(
        `/api/reports/analytics?startDate=${startDate}&endDate=${endDate}&period=${dateRange}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
      console.log("📊 Analytics data loaded successfully");

      // Summary cards loaded immediately (main loading done)
      setLoading(false);

      // PROGRESSIVE CHART LOADING - Load charts one by one
      setTimeout(
        () => setChartsLoaded((prev) => ({ ...prev, revenueTimeline: true })),
        100,
      );
      setTimeout(
        () => setChartsLoaded((prev) => ({ ...prev, paymentMethods: true })),
        300,
      );
      setTimeout(
        () => setChartsLoaded((prev) => ({ ...prev, topCourts: true })),
        500,
      );
      setTimeout(
        () => setChartsLoaded((prev) => ({ ...prev, peakHours: true })),
        700,
      );
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

  const { summary } = analytics;

  return (
    <div className="space-y-8">
      {/* Date Range Picker */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between gap-2">
            <div className="flex flex-col gap-4">
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

              <div className="text-sm text-muted-foreground">
                Showing data from{" "}
                <strong>
                  {new Date(analytics.startDate).toLocaleDateString("id-ID")}
                </strong>{" "}
                to{" "}
                <strong>
                  {new Date(analytics.endDate).toLocaleDateString("id-ID")}
                </strong>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={fetchAnalytics} variant="outline" className="">
                <BarChart3 className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} className="">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📊 OVERVIEW SECTION */}
      <div>
        <SectionHeader
          icon={TrendingUp}
          title="Business Overview"
          description="Your key performance metrics at a glance"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Gross Revenue
                  </CardTitle>
                  <InfoTooltip text="Total value of all bookings before fees and refunds. This is what customers paid for court time." />
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  IDR {summary.totalRevenue.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  What customers paid
                </p>
                {analytics.comparison && (
                  <div className="flex items-center gap-1 mt-2">
                    {analytics.comparison.totalRevenue >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        analytics.comparison.totalRevenue >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.comparison.totalRevenue >= 0 ? "+" : ""}
                      {analytics.comparison.totalRevenue.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs previous period
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Net Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Actual Earnings
                  </CardTitle>
                  <InfoTooltip text="Your actual earnings after payment processing fees and refunds. This is the money that stays with your business." />
                </div>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  IDR{" "}
                  {summary.netRevenueAfterRefunds
                    ? summary.netRevenueAfterRefunds.toLocaleString("id-ID")
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  After {summary.totalFeesAbsorbed.toLocaleString("id-ID")} fees
                  · {(summary.totalRefundAmount || 0).toLocaleString("id-ID")}{" "}
                  refunds
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 mt-2">
                  {Math.round(
                    summary.netRevenueAfterRefunds
                      ? (summary.netRevenueAfterRefunds /
                          summary.totalRevenue) *
                          100
                      : 0,
                  )}
                  % of total
                </span>

                {analytics.comparison && (
                  <div className="flex items-center gap-1 mt-2">
                    {analytics.comparison.netRevenueAfterRefunds >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        analytics.comparison.netRevenueAfterRefunds >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.comparison.netRevenueAfterRefunds >= 0
                        ? "+"
                        : ""}
                      {analytics.comparison.netRevenueAfterRefunds.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs previous period
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Bookings
                  </CardTitle>
                  <InfoTooltip text="Number of confirmed bookings. Average value shows how much each booking brings in." />
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.totalBookings}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: IDR{" "}
                  {Math.round(summary.averageBookingValue).toLocaleString(
                    "id-ID",
                  )}
                  /booking
                </p>
                {analytics.comparison && (
                  <div className="flex items-center gap-1 mt-2">
                    {analytics.comparison.totalBookings >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        analytics.comparison.totalBookings >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.comparison.totalBookings >= 0 ? "+" : ""}
                      {analytics.comparison.totalBookings.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs previous period
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Refunds Processed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Refunds Processed
                  </CardTitle>
                  <InfoTooltip text="Cancelled bookings where money was returned to customers. Lower is better." />
                </div>
                <div className="p-2 rounded-lg bg-purple-100">
                  <TrendingDown className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.totalRefunds || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  IDR {(summary.totalRefundAmount || 0).toLocaleString("id-ID")}{" "}
                  refunded
                </p>
                {/* Show breakdown of full vs partial */}
                {(summary.fullRefunds > 0 || summary.partialRefunds > 0) && (
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    {summary.fullRefunds > 0 && (
                      <div>
                        • {summary.fullRefunds} full refund
                        {summary.fullRefunds > 1 ? "s" : ""}
                      </div>
                    )}
                    {summary.partialRefunds > 0 && (
                      <div>
                        • {summary.partialRefunds} partial refund
                        {summary.partialRefunds > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
                    (summary.totalRefunds || 0) / summary.totalBookings < 0.1
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {Math.round(
                    ((summary.totalRefunds || 0) / summary.totalBookings) * 100,
                  )}
                  % cancellation rate
                </span>
                {analytics.comparison && (
                  <div className="flex items-center gap-1 mt-2">
                    {analytics.comparison.totalRefunds <= 0 ? (
                      <TrendingDown className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        analytics.comparison.totalRefunds <= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.comparison.totalRefunds >= 0 ? "+" : ""}
                      {analytics.comparison.totalRefunds.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs previous period
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Revenue Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-forest" />
              Revenue Timeline
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track your daily revenue trends across all payment channels
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {chartsLoaded.revenueTimeline ? (
              <RevenueChart data={analytics.revenueTimeline} />
            ) : (
              <ChartSkeleton />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 💰 REVENUE BREAKDOWN */}
      <div>
        <SectionHeader
          icon={Receipt}
          title="Revenue Breakdown"
          description="How your revenue is collected and processed"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Online Payments */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Online Payments
                    </h3>
                    <p className="text-xs text-gray-500">Via Midtrans</p>
                  </div>
                </div>
                <InfoTooltip text="Money collected online during booking (deposits or full payments)" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    IDR {summary.onlineRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(
                      (summary.onlineRevenue / summary.totalRevenue) * 100,
                    )}
                    % of total revenue
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Deposit bookings</span>
                    <span className="font-medium">
                      {summary.depositBookings}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Full payment bookings</span>
                    <span className="font-medium">
                      {summary.fullPaymentBookings}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venue Payments */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Banknote className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Venue Payments
                    </h3>
                    <p className="text-xs text-gray-500">Cash collected</p>
                  </div>
                </div>
                <InfoTooltip text="Remaining balance collected in cash at the venue (for deposit bookings)" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-amber-600">
                    IDR {summary.venueRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(
                      (summary.venueRevenue / summary.totalRevenue) * 100,
                    )}
                    % of total revenue
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    💡 Balance paid by deposit customers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fees Impact */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Payment Fees
                    </h3>
                    <p className="text-xs text-gray-500">Midtrans charges</p>
                  </div>
                </div>
                <InfoTooltip text="Processing fees charged by Midtrans for online payments. These are automatically deducted." />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-red-600">
                    -IDR {summary.totalFeesAbsorbed.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(
                      (summary.totalFeesAbsorbed / summary.onlineRevenue) *
                      100
                    ).toFixed(2)}
                    % of online revenue
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    💡 Venue payments have no fees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Court Revenue */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Court Revenue
                    </h3>
                    <p className="text-xs text-gray-500">Court bookings</p>
                  </div>
                </div>
                <InfoTooltip text="Revenue from court time bookings (excludes equipment)" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    IDR {summary.courtRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(
                      (summary.courtRevenue / summary.totalRevenue) * 100,
                    )}
                    % of total revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Revenue */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Equipment Revenue
                    </h3>
                    <p className="text-xs text-gray-500">Racket rentals</p>
                  </div>
                </div>
                <InfoTooltip text="Revenue from equipment rentals (rackets, etc.)" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-purple-600">
                    IDR {summary.equipmentRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(
                      (summary.equipmentRevenue / summary.totalRevenue) * 100,
                    )}
                    % of total revenue
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Rental rate</span>
                    <span className="font-medium">
                      {summary.equipmentRentalRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Bookings with equipment
                    </span>
                    <span className="font-medium">
                      {summary.bookingsWithEquipment}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-forest" />
              Payment Methods Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              See which payment methods your customers prefer
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {chartsLoaded.paymentMethods ? (
              <PaymentMethodChart data={analytics.paymentMethods} />
            ) : (
              <ChartSkeleton />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 📈 PERFORMANCE INSIGHTS */}
      <div>
        <SectionHeader
          icon={Trophy}
          title="Performance Insights"
          description="Key metrics showing how well your business is doing"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Success Rate</h3>
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-bold text-green-600">
                  {Math.round(
                    (summary.revenueContributingBookings /
                      summary.totalBookings) *
                      100,
                  )}
                  %
                </p>
                <p className="text-sm text-gray-600">
                  {summary.revenueContributingBookings} out of{" "}
                  {summary.totalBookings} bookings completed
                </p>
                <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (summary.revenueContributingBookings /
                          summary.totalBookings) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Revenue per Booking
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-bold text-blue-600">
                  IDR{" "}
                  {Math.round(summary.averageBookingValue).toLocaleString(
                    "id-ID",
                  )}
                </p>
                <p className="text-sm text-gray-600">Average booking value</p>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-500">
                    💡 Higher average = better revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Cancellation Impact
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-bold text-purple-600">
                  IDR {(summary.totalRefundAmount || 0).toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-600">
                  Lost to {summary.totalRefunds || 0} cancellations
                </p>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-gray-500">
                    {(
                      ((summary.totalRefundAmount || 0) /
                        summary.totalRevenue) *
                      100
                    ).toFixed(1)}
                    % of total revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Best/Worst Performers */}
        {(analytics.bestCourt || analytics.worstCourt) && (
          <div
            className={`grid grid-cols-1 ${analytics.worstCourt ? "md:grid-cols-2" : ""} gap-6 mb-8`}
          >
            {/* Best Performer */}
            {analytics.bestCourt && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500 rounded-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        🏆 Top Performer
                      </h3>
                      <p className="text-xs text-gray-600">
                        Highest revenue this period
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-green-600">
                      {analytics.bestCourt.courtName}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-green-200">
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-lg font-bold text-gray-900">
                          IDR{" "}
                          {analytics.bestCourt.revenue.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Bookings</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analytics.bestCourt.bookings}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Avg: IDR{" "}
                      {Math.round(
                        analytics.bestCourt.revenue /
                          analytics.bestCourt.bookings,
                      ).toLocaleString("id-ID")}
                      /booking
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Worst Performer */}
            {analytics.worstCourt && (
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-500 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        ⚠️ Needs Attention
                      </h3>
                      <p className="text-xs text-gray-600">
                        Lowest revenue this period
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-orange-600">
                      {analytics.worstCourt.courtName}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-orange-200">
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-lg font-bold text-gray-900">
                          IDR{" "}
                          {analytics.worstCourt.revenue.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Bookings</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analytics.worstCourt.bookings}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-orange-600 mt-2">
                      💡 Consider promotions or check equipment condition
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Peak vs Off-Peak Analysis */}
        {analytics.peakVsOffPeak && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-forest" />
                Peak vs Off-Peak Performance
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue distribution by time of day
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Peak Hours */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Peak Hours</h3>
                      <p className="text-xs text-gray-600">
                        {analytics.peakVsOffPeak.peak.hours}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-bold text-purple-600">
                        IDR{" "}
                        {analytics.peakVsOffPeak.peak.revenue.toLocaleString(
                          "id-ID",
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {analytics.peakVsOffPeak.peak.percentage.toFixed(1)}% of
                        total revenue
                      </p>
                    </div>

                    <div className="pt-3 border-t border-purple-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bookings</span>
                        <span className="font-bold text-gray-900">
                          {analytics.peakVsOffPeak.peak.bookings}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Avg per booking</span>
                        <span className="font-bold text-gray-900">
                          IDR{" "}
                          {analytics.peakVsOffPeak.peak.bookings > 0
                            ? Math.round(
                                analytics.peakVsOffPeak.peak.revenue /
                                  analytics.peakVsOffPeak.peak.bookings,
                              ).toLocaleString("id-ID")
                            : 0}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-purple-200 rounded-full h-3 mt-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${analytics.peakVsOffPeak.peak.percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Off-Peak Hours */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Off-Peak Hours
                      </h3>
                      <p className="text-xs text-gray-600">
                        {analytics.peakVsOffPeak.offPeak.hours}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        IDR{" "}
                        {analytics.peakVsOffPeak.offPeak.revenue.toLocaleString(
                          "id-ID",
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {analytics.peakVsOffPeak.offPeak.percentage.toFixed(1)}%
                        of total revenue
                      </p>
                    </div>

                    <div className="pt-3 border-t border-blue-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bookings</span>
                        <span className="font-bold text-gray-900">
                          {analytics.peakVsOffPeak.offPeak.bookings}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Avg per booking</span>
                        <span className="font-bold text-gray-900">
                          IDR{" "}
                          {analytics.peakVsOffPeak.offPeak.bookings > 0
                            ? Math.round(
                                analytics.peakVsOffPeak.offPeak.revenue /
                                  analytics.peakVsOffPeak.offPeak.bookings,
                              ).toLocaleString("id-ID")
                            : 0}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-blue-200 rounded-full h-3 mt-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${analytics.peakVsOffPeak.offPeak.percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 Consider offering discounts during off-peak hours to
                      increase bookings
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Courts Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-forest" />
                Top Performing Courts
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Which courts generate the most revenue
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              {chartsLoaded.topCourts ? (
                <TopCourtsChart data={analytics.topCourts} />
              ) : (
                <ChartSkeleton />
              )}
            </CardContent>
          </Card>

          {/* Peak Hours Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-forest" />
                Peak Hours Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Most popular booking times
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              {chartsLoaded.peakHours ? (
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
                            className="bg-forest h-3 rounded-full transition-all"
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
              ) : (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* NEW: 🎾 EQUIPMENT & PLAYER ANALYTICS */}
      <div>
        <SectionHeader
          icon={Trophy}
          title="Equipment & Player Analytics"
          description="Rental statistics and player engagement metrics"
        />

        {/* Equipment Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Rental Rate */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Equipment Rental Rate
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-purple-600">
                  {summary.equipmentRentalRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">
                  {summary.bookingsWithEquipment} out of {summary.totalBookings}{" "}
                  bookings
                </p>
                <div className="w-full bg-purple-200 rounded-full h-3 mt-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${summary.equipmentRentalRate}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Players */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Average Players</h3>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-blue-600">
                  {summary.averagePlayersPerBooking.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">
                  {summary.totalPlayers} total players across all bookings
                </p>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-500">
                    💡 Most bookings are for{" "}
                    {Math.round(summary.averagePlayersPerBooking)} players
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Revenue Impact */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Equipment Impact
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-amber-600">
                  +
                  {(
                    (summary.equipmentRevenue / summary.courtRevenue) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-sm text-gray-600">
                  Additional revenue from equipment
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-xs text-gray-500">
                    💡 Equipment adds IDR{" "}
                    {summary.equipmentRevenue.toLocaleString("id-ID")} to court
                    revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Breakdown Chart */}
        {analytics.equipmentBreakdown &&
          analytics.equipmentBreakdown.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-forest" />
                  Popular Equipment
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Which equipment items are rented most frequently
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {analytics.equipmentBreakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rented in {item.bookings} bookings
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600 text-lg">
                          {item.quantity}x
                        </p>
                        <p className="text-sm text-gray-500">
                          IDR {item.revenue.toLocaleString("id-ID")} revenue
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Revenue Formula Explainer */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-gray-800 rounded-lg">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                How We Calculate Your Earnings
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Simple breakdown of where your money comes from and goes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                  1
                </div>
                <span className="font-medium text-gray-700">
                  Gross Revenue (What customers paid)
                </span>
              </div>
              <span className="text-xl font-bold text-green-600">
                IDR {summary.totalRevenue.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                  -
                </div>
                <span className="font-medium text-gray-700">
                  Payment Processing Fees
                </span>
              </div>
              <span className="text-xl font-bold text-red-600">
                -IDR {summary.totalFeesAbsorbed.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                  -
                </div>
                <span className="font-medium text-gray-700">
                  Refunds to Customers
                </span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                -IDR {(summary.totalRefundAmount || 0).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="h-px bg-gray-300 my-2"></div>

            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  =
                </div>
                <span className="font-bold text-lg">
                  Your Actual Earnings (What you keep)
                </span>
              </div>
              <span className="text-2xl font-bold">
                IDR{" "}
                {summary.netRevenueAfterRefunds
                  ? summary.netRevenueAfterRefunds.toLocaleString("id-ID")
                  : "0"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPageClient;

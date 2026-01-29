import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { RevenueData } from "@/types/reports";

// Cache TTL: 1 minute for reports
const CACHE_TTL = 60; // seconds

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const authSupabase = await createAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    // Verify admin role
    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!adminRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);

    const startDate =
      searchParams.get("startDate") || new Date().toISOString().split("T")[0];
    const endDate =
      searchParams.get("endDate") || new Date().toISOString().split("T")[0];
    const period = searchParams.get("period") || "day";

    // CREATE CACHE KEY
    const cacheKey = `padelbap:reports:analytics:${startDate}:${endDate}:${period}`;

    // TRY TO GET FROM CACHE FIRST
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("📊 Cache HIT - Returning cached analytics:", cacheKey);
        return NextResponse.json(cachedData);
      }
      console.log("📊 Cache MISS - Fetching fresh data:", cacheKey);
    } catch (cacheError) {
      console.error("📊 Cache read error:", cacheError);
      // Continue to fetch fresh data if cache fails
    }

    // Calculate previous period for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - daysDiff);
    const previousStartDate = prevStart.toISOString().split("T")[0];
    const previousEndDate = new Date(start.setDate(start.getDate() - 1))
      .toISOString()
      .split("T")[0];

    console.log("📊 Analytics request:", {
      startDate,
      endDate,
      period,
      previousStartDate,
      previousEndDate,
      daysDiff,
    });

    // FETCH CURRENT PERIOD BOOKINGS
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        courts (name),
        venue_payments (*)
      `,
      )
      .gte("date", startDate)
      .lte("date", endDate)
      .in("status", ["PAID", "REFUNDED"]);

    if (bookingsError) {
      console.error("❌ Bookings fetch error:", bookingsError);
      throw bookingsError;
    }

    console.log("📊 Found current bookings:", bookings.length);

    // PROCESS BOOKINGS - Calculate actual money flow for each booking
    const processedBookings = bookings.map((b) => {
      // How much did customer pay online?
      const onlinePaid = b.require_deposit ? b.deposit_amount : b.total_amount;

      // How much was refunded?
      const refunded = parseFloat(b.refund_amount || "0");

      // How much online money did we keep?
      const onlineKept = onlinePaid - refunded;

      // Venue payment (only if received)
      const venueKept = b.venue_payment_received
        ? b.venue_payment_amount || 0
        : 0;

      // Total revenue from this booking
      const totalKept = onlineKept + venueKept;

      // Payment fee
      const fee = b.payment_fee || 0;

      return {
        ...b,
        onlineKept, // Money kept from online payment (after refunds)
        venueKept, // Money kept from venue payment
        totalKept, // Total revenue from this booking
        refunded, // Amount refunded
        fee, // Payment processing fee
        hasRevenue: totalKept > 0, // Does this booking contribute revenue?
      };
    });

    console.log("📊 Processed bookings:", {
      total: processedBookings.length,
      withRevenue: processedBookings.filter((b) => b.hasRevenue).length,
      refunded: processedBookings.filter((b) => b.refunded > 0).length,
    });

    // Only count bookings that contributed revenue
    const revenueBookings = processedBookings.filter((b) => b.hasRevenue);

    // SUMMARY CALCULATIONS

    // Total Bookings = ALL bookings (including refunded)
    const totalBookings = processedBookings.length;

    // Revenue Contributing Bookings = Bookings that kept money
    const revenueContributingBookings = revenueBookings.length;

    // Gross Revenue = Total money kept (online + venue, after refunds)
    const totalRevenue = processedBookings.reduce(
      (sum, b) => sum + b.totalKept,
      0,
    );

    // Online Revenue = Money kept from online payments (after refunds)
    const onlineRevenue = processedBookings.reduce(
      (sum, b) => sum + b.onlineKept,
      0,
    );

    // Venue Revenue = Money kept from venue payments
    const venueRevenue = processedBookings.reduce(
      (sum, b) => sum + b.venueKept,
      0,
    );

    // Total Fees
    const totalFeesAbsorbed = processedBookings.reduce(
      (sum, b) => sum + b.fee,
      0,
    );

    // Net Revenue = Total revenue minus fees
    const netRevenue = totalRevenue - totalFeesAbsorbed;

    // Actual Earnings = Net Revenue (same thing now, refunds already accounted for)
    const netRevenueAfterRefunds = netRevenue;

    // Average Booking Value (only count bookings with revenue)
    const averageBookingValue =
      revenueContributingBookings > 0
        ? totalRevenue / revenueContributingBookings
        : 0;

    // Deposit vs Full Payment (count ALL bookings, not just revenue ones)
    const depositBookings = processedBookings.filter(
      (b) => b.require_deposit,
    ).length;
    const fullPaymentBookings = processedBookings.filter(
      (b) => !b.require_deposit,
    ).length;

    // Refund Statistics
    const refundedBookings = processedBookings.filter((b) => b.refunded > 0);
    const totalRefunds = refundedBookings.length;
    const totalRefundAmount = processedBookings.reduce(
      (sum, b) => sum + b.refunded,
      0,
    );

    // Full vs Partial refunds
    const fullRefunds = refundedBookings.filter(
      (b) => b.onlineKept === 0 && b.venueKept === 0,
    ).length;
    const partialRefunds = refundedBookings.filter(
      (b) => b.totalKept > 0,
    ).length;

    const summary = {
      totalRevenue,
      netRevenue,
      onlineRevenue,
      venueRevenue,
      totalFeesAbsorbed,
      totalBookings,
      revenueContributingBookings,
      averageBookingValue,
      depositBookings,
      fullPaymentBookings,
      totalRefunds,
      totalRefundAmount,
      fullRefunds,
      partialRefunds,
      netRevenueAfterRefunds,
    };

    console.log("📊 Summary:", summary);

    // PREVIOUS PERIOD FOR COMPARISON
    const { data: previousBookings } = await supabase
      .from("bookings")
      .select("*")
      .gte("date", previousStartDate)
      .lte("date", previousEndDate)
      .in("status", ["PAID", "REFUNDED"]);

    // Process previous period bookings the same way
    const prevProcessed = (previousBookings || []).map((b) => {
      const onlinePaid = b.require_deposit ? b.deposit_amount : b.total_amount;
      const refunded = parseFloat(b.refund_amount || "0");
      const onlineKept = onlinePaid - refunded;
      const venueKept = b.venue_payment_received
        ? b.venue_payment_amount || 0
        : 0;
      const totalKept = onlineKept + venueKept;
      const fee = b.payment_fee || 0;

      return {
        ...b,
        onlineKept,
        venueKept,
        totalKept,
        refunded,
        fee,
        hasRevenue: totalKept > 0,
      };
    });

    const prevTotalBookings = prevProcessed.length; // All bookings (changed from revenue only)
    const prevTotalRevenue = prevProcessed.reduce(
      (sum, b) => sum + b.totalKept,
      0,
    );
    const prevTotalFees = prevProcessed.reduce((sum, b) => sum + b.fee, 0);
    const prevNetRevenueAfterRefunds = prevTotalRevenue - prevTotalFees;
    const prevTotalRefunds = prevProcessed.filter((b) => b.refunded > 0).length;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const comparison = {
      totalRevenue: calculateChange(totalRevenue, prevTotalRevenue),
      netRevenueAfterRefunds: calculateChange(
        netRevenueAfterRefunds,
        prevNetRevenueAfterRefunds,
      ),
      totalBookings: calculateChange(totalBookings, prevTotalBookings),
      totalRefunds: calculateChange(totalRefunds, prevTotalRefunds),
    };

    console.log("📊 Comparison:", comparison);

    // REVENUE TIMELINE (group by date)
    const revenueByDate = processedBookings.reduce(
      (acc: Record<string, RevenueData>, b) => {
        const date = b.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            onlineRevenue: 0,
            venueRevenue: 0,
            totalRevenue: 0,
            netRevenue: 0,
            feesAbsorbed: 0,
          };
        }

        acc[date].onlineRevenue += b.onlineKept;
        acc[date].venueRevenue += b.venueKept;
        acc[date].totalRevenue += b.totalKept;
        acc[date].netRevenue += b.totalKept - b.fee;
        acc[date].feesAbsorbed += b.fee;

        return acc;
      },
      {},
    );

    const revenueTimeline = Object.values(revenueByDate).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // PAYMENT METHODS (only count money we kept)
    const paymentMethodsMap = processedBookings.reduce(
      (acc: Record<string, { count: number; amount: number }>, b) => {
        // Only count if we kept money from online payment
        if (b.onlineKept > 0) {
          const method = b.payment_method?.toUpperCase() || "UNKNOWN";
          if (!acc[method]) {
            acc[method] = { count: 0, amount: 0 };
          }
          acc[method].count += 1;
          acc[method].amount += b.onlineKept;
        }

        // Venue payment (if received)
        if (b.venueKept > 0) {
          const venueMethod =
            `VENUE_${b.venue_payment_method || "CASH"}`.toUpperCase();
          if (!acc[venueMethod]) {
            acc[venueMethod] = { count: 0, amount: 0 };
          }
          acc[venueMethod].count += 1;
          acc[venueMethod].amount += b.venueKept;
        }

        return acc;
      },
      {},
    );

    const totalAmount = Object.values(paymentMethodsMap).reduce(
      (sum, m) => sum + m.amount,
      0,
    );

    const paymentMethods = Object.entries(paymentMethodsMap).map(
      ([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }),
    );

    console.log("💳 Payment Methods:", paymentMethods);

    // TOP COURTS (only revenue we kept)
    const courtStats = processedBookings.reduce(
      (acc: Record<string, { bookings: number; revenue: number }>, b) => {
        if (b.hasRevenue) {
          const courtName = b.courts?.name || "Unknown Court";
          if (!acc[courtName]) {
            acc[courtName] = { bookings: 0, revenue: 0 };
          }
          acc[courtName].bookings += 1;
          acc[courtName].revenue += b.totalKept;
        }
        return acc;
      },
      {},
    );

    const topCourts = Object.entries(courtStats)
      .map(([courtName, stats]) => ({
        courtName,
        bookings: stats.bookings,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const bestCourt = topCourts.length > 0 ? topCourts[0] : null;
    const worstCourt =
      topCourts.length > 1 ? topCourts[topCourts.length - 1] : null;

    // PEAK HOURS ANALYSIS
    const hourStats = processedBookings.reduce(
      (acc: Record<string, { bookings: number; revenue: number }>, b) => {
        if (b.hasRevenue) {
          const hour = b.time.split(" - ")[0];
          if (!acc[hour]) {
            acc[hour] = { bookings: 0, revenue: 0 };
          }
          acc[hour].bookings += 1;
          acc[hour].revenue += b.totalKept;
        }
        return acc;
      },
      {},
    );

    const peakHours = Object.entries(hourStats)
      .map(([hour, stats]) => ({
        hour,
        bookings: stats.bookings,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.bookings - a.bookings);

    // PEAK VS OFF-PEAK ANALYSIS
    const peakHoursList = [
      "06:00",
      "07:00",
      "08:00",
      "09:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
    ];
    const offPeakHoursList = ["10:00", "11:00", "12:00", "13:00", "14:00"];

    let peakRevenue = 0;
    let peakBookings = 0;
    let offPeakRevenue = 0;
    let offPeakBookings = 0;

    processedBookings.forEach((b) => {
      if (b.hasRevenue) {
        const hour = b.time.split(" - ")[0];

        if (peakHoursList.includes(hour)) {
          peakRevenue += b.totalKept;
          peakBookings += 1;
        } else if (offPeakHoursList.includes(hour)) {
          offPeakRevenue += b.totalKept;
          offPeakBookings += 1;
        }
      }
    });

    const peakVsOffPeak = {
      peak: {
        revenue: peakRevenue,
        bookings: peakBookings,
        percentage: totalRevenue > 0 ? (peakRevenue / totalRevenue) * 100 : 0,
        hours: "6am-9am & 3pm-9pm",
      },
      offPeak: {
        revenue: offPeakRevenue,
        bookings: offPeakBookings,
        percentage:
          totalRevenue > 0 ? (offPeakRevenue / totalRevenue) * 100 : 0,
        hours: "10am-2pm",
      },
    };

    console.log("📊 Peak vs Off-Peak:", peakVsOffPeak);

    // PREPARE RESPONSE
    const responseData = {
      success: true,
      period,
      startDate,
      endDate,
      summary,
      comparison,
      revenueTimeline,
      paymentMethods,
      topCourts,
      bestCourt,
      worstCourt,
      peakHours,
      peakVsOffPeak,
    };

    // CACHE THE RESPONSE
    try {
      await redis.set(cacheKey, responseData, { ex: CACHE_TTL });
      console.log("📊 Cached analytics data for 1 minute:", cacheKey);
    } catch (cacheError) {
      console.error("📊 Cache write error:", cacheError);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

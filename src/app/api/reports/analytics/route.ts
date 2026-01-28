import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { RevenueData } from "@/types/reports";

// Cache TTL: 5 minutes for reports
const CACHE_TTL = 300; // seconds

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

    // Fetch PAID and REFUNDED separately
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
      .in("status", ["PAID", "REFUNDED"]); // Get both for analysis

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 },
      );
    }

    console.log("📊 Found current bookings:", bookings.length);

    // Fetch previous period bookings for comparison
    const { data: previousBookings, error: previousBookingsError } =
      await supabase
        .from("bookings")
        .select("*")
        .gte("date", previousStartDate)
        .lte("date", previousEndDate)
        .in("status", ["PAID", "REFUNDED"]);

    if (previousBookingsError) {
      console.error("Error fetching previous bookings:", previousBookingsError);
      return NextResponse.json(
        { error: "Failed to fetch previous bookings" },
        { status: 500 },
      );
    }

    console.log("📊 Found previous bookings:", previousBookings?.length || 0);

    // Calculate Summary Statistics (excluding refunded)
    const paidBookings = bookings.filter((b) => b.status === "PAID");
    const refundedBookings = bookings.filter((b) => b.status === "REFUNDED");

    const totalBookings = paidBookings.length;

    // Online revenue (deposits + full payments, excluding fees) - ONLY PAID
    const onlineRevenue = paidBookings.reduce((sum, b) => {
      return sum + (b.require_deposit ? b.deposit_amount : b.subtotal);
    }, 0);

    // Only count venue payments that have been received
    const venueRevenue = paidBookings.reduce((sum, b) => {
      return sum + (b.venue_payment_received ? b.venue_payment_amount || 0 : 0);
    }, 0);

    // Gross Revenue = Money actually collected (online + venue payments received)
    const totalRevenue = paidBookings.reduce((sum, b) => {
      const onlineCollected = b.require_deposit ? b.deposit_amount : b.subtotal;
      const venueCollected = b.venue_payment_received
        ? b.venue_payment_amount || 0
        : 0;
      return sum + onlineCollected + venueCollected;
    }, 0);

    // Net Revenue = Money collected minus (MIDTRANS) fees
    const netRevenue = paidBookings.reduce((sum, b) => {
      const onlineNet = b.total_amount - b.payment_fee;
      const venueNet = b.venue_payment_received
        ? b.venue_payment_amount || 0
        : 0;
      return sum + onlineNet + venueNet;
    }, 0);

    // Total fees absorbed - ONLY PAID
    const totalFeesAbsorbed = paidBookings.reduce(
      (sum, b) => sum + b.payment_fee,
      0,
    );

    // REFUND CALCULATIONS
    const totalRefunds = refundedBookings.length;
    const totalRefundAmount = refundedBookings.reduce(
      (sum, b) => sum + (b.refund_amount || 0),
      0,
    );

    // Net revenue after refunds
    const netRevenueAfterRefunds = netRevenue - totalRefundAmount;

    // Average booking value - ONLY PAID
    const averageBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Deposit vs Full payment bookings - ONLY PAID
    const depositBookings = paidBookings.filter(
      (b) => b.require_deposit,
    ).length;
    const fullPaymentBookings = totalBookings - depositBookings;

    const summary = {
      totalRevenue,
      onlineRevenue,
      venueRevenue,
      netRevenue,
      totalFeesAbsorbed,
      totalBookings,
      averageBookingValue,
      depositBookings,
      fullPaymentBookings,
      totalRefunds,
      totalRefundAmount,
      netRevenueAfterRefunds,
    };

    console.log("📊 Summary calculated:", summary);

    // Calculate previous period summary for comparison
    const prevPaidBookings =
      previousBookings?.filter((b) => b.status === "PAID") || [];
    const prevRefundedBookings =
      previousBookings?.filter((b) => b.status === "REFUNDED") || [];

    const prevTotalBookings = prevPaidBookings.length;
    const prevTotalRevenue = prevPaidBookings.reduce((sum, b) => {
      const onlineCollected = b.require_deposit ? b.deposit_amount : b.subtotal;
      const venueCollected = b.venue_payment_received
        ? b.venue_payment_amount || 0
        : 0;
      return sum + onlineCollected + venueCollected;
    }, 0);
    const prevOnlineRevenue = prevPaidBookings.reduce((sum, b) => {
      return sum + (b.require_deposit ? b.deposit_amount : b.subtotal);
    }, 0);
    const prevVenueRevenue = prevPaidBookings.reduce((sum, b) => {
      return sum + (b.venue_payment_received ? b.venue_payment_amount || 0 : 0);
    }, 0);
    const prevNetRevenue = prevPaidBookings.reduce((sum, b) => {
      const onlineNet = b.total_amount - b.payment_fee;
      const venueNet = b.venue_payment_received
        ? b.venue_payment_amount || 0
        : 0;
      return sum + onlineNet + venueNet;
    }, 0);
    const prevTotalRefunds = prevRefundedBookings.length;
    const prevTotalRefundAmount = prevRefundedBookings.reduce(
      (sum, b) => sum + (b.refund_amount || 0),
      0,
    );
    const prevNetRevenueAfterRefunds = prevNetRevenue - prevTotalRefundAmount;

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
      totalRefunds: calculateChange(totalRefunds || 0, prevTotalRefunds),
    };

    console.log("📊 Comparison vs previous period:", comparison);

    // Revenue Timeline (group by date) - ONLY PAID BOOKINGS
    const revenueByDate = paidBookings.reduce(
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
        const online = b.require_deposit ? b.deposit_amount : b.subtotal;
        const venue = b.venue_payment_received
          ? b.venue_payment_amount || 0
          : 0;
        const onlineNet = b.total_amount - b.payment_fee;

        acc[date].onlineRevenue += online;
        acc[date].venueRevenue += venue;
        acc[date].totalRevenue += online + venue;
        acc[date].netRevenue += onlineNet + venue;
        acc[date].feesAbsorbed += b.payment_fee;

        return acc;
      },
      {},
    );

    // Subtract refunds from the same dates
    refundedBookings.forEach((b) => {
      const date = b.date;
      if (revenueByDate[date]) {
        // Subtract refund amount from net revenue to get actual earnings
        revenueByDate[date].netRevenue -= b.refund_amount || 0;
      } else {
        // If refund happened on a date with no other bookings, create entry with negative
        revenueByDate[date] = {
          date,
          onlineRevenue: 0,
          venueRevenue: 0,
          totalRevenue: 0,
          netRevenue: -(b.refund_amount || 0),
          feesAbsorbed: 0,
        };
      }
    });

    const revenueTimeline = Object.values(revenueByDate).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // Payment Methods Breakdown - ONLY PAID
    const paymentMethodsMap = paidBookings.reduce(
      (acc: Record<string, { count: number; amount: number }>, b) => {
        // Online payment method
        const method = b.payment_method?.toUpperCase() || "UNKNOWN";
        if (!acc[method]) {
          acc[method] = { count: 0, amount: 0 };
        }
        acc[method].count += 1;
        // Use the actual revenue (deposit or subtotal) NOT total_amount
        const onlineAmount = b.require_deposit ? b.deposit_amount : b.subtotal;
        acc[method].amount += onlineAmount;

        // Venue payment method (if exists)
        if (b.venue_payment_method && b.venue_payment_amount > 0) {
          const venueMethod = `VENUE_${b.venue_payment_method}`;
          if (!acc[venueMethod]) {
            acc[venueMethod] = { count: 0, amount: 0 };
          }
          acc[venueMethod].count += 1;
          acc[venueMethod].amount += b.venue_payment_amount;
        }

        return acc;
      },
      {},
    );

    const totalAmount = Object.values(paymentMethodsMap).reduce(
      (sum: number, m) => sum + m.amount,
      0,
    );

    console.log("💳 Payment Methods Map:", paymentMethodsMap);
    console.log("💳 Total Amount for percentages:", totalAmount);

    const paymentMethods = Object.entries(paymentMethodsMap).map(
      ([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }),
    );

    console.log("💳 Final Payment Methods:", paymentMethods);

    // Top Performing Courts - (online + venue payments received)
    const courtStats = paidBookings.reduce(
      (acc: Record<string, { bookings: number; revenue: number }>, b) => {
        const courtName = b.courts?.name || "Unknown Court";
        if (!acc[courtName]) {
          acc[courtName] = { bookings: 0, revenue: 0 };
        }
        acc[courtName].bookings += 1;

        // Only count collected revenue (online + venue if received)
        const onlineCollected = b.require_deposit
          ? b.deposit_amount
          : b.subtotal;
        const venueCollected = b.venue_payment_received
          ? b.venue_payment_amount || 0
          : 0;
        acc[courtName].revenue += onlineCollected + venueCollected;

        return acc;
      },
      {},
    );

    // Get top 5 courts by revenue
    const topCourts = Object.entries(courtStats)
      .map(([courtName, stats]) => ({
        courtName,
        bookings: stats.bookings,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Best and Worst Performers
    // Only show "worst" if there are 2+ courts (otherwise it's the same as best!)
    const bestCourt = topCourts.length > 0 ? topCourts[0] : null;
    const worstCourt =
      topCourts.length > 1 ? topCourts[topCourts.length - 1] : null;

    // Peak Hours Analysis - (online + venue payments received)
    const hourStats = paidBookings.reduce(
      (acc: Record<string, { bookings: number; revenue: number }>, b) => {
        const hour = b.time.split(" - ")[0];
        if (!acc[hour]) {
          acc[hour] = { bookings: 0, revenue: 0 };
        }
        acc[hour].bookings += 1;

        // Only count collected revenue
        const onlineCollected = b.require_deposit
          ? b.deposit_amount
          : b.subtotal;
        const venueCollected = b.venue_payment_received
          ? b.venue_payment_amount || 0
          : 0;
        acc[hour].revenue += onlineCollected + venueCollected;

        return acc;
      },
      {},
    );

    // Sorting peak hours by bookings
    const peakHours = Object.entries(hourStats)
      .map(([hour, stats]) => ({
        hour,
        bookings: stats.bookings,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.bookings - a.bookings);

    // Peak vs Off-Peak Analysis
    // Peak hours: Morning (6am-9am) + Evening (3pm-9pm)
    // Off-peak: Midday (10am-2pm)
    const peakHoursList = [
      "06:00",
      "07:00",
      "08:00",
      "09:00", // Morning peak
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00", // Evening peak
    ];
    const offPeakHoursList = ["10:00", "11:00", "12:00", "13:00", "14:00"];

    let peakRevenue = 0;
    let peakBookings = 0;
    let offPeakRevenue = 0;
    let offPeakBookings = 0;

    // Calculate revenues and bookings for peak and off-peak
    paidBookings.forEach((b) => {
      // Extract start hour like "14:00"
      const hour = b.time.split(" - ")[0];

      // Only count collected revenue (online + venue if received)
      const onlineCollected = b.require_deposit ? b.deposit_amount : b.subtotal;
      const venueCollected = b.venue_payment_received
        ? b.venue_payment_amount || 0
        : 0;
      const collectedRevenue = onlineCollected + venueCollected;

      if (peakHoursList.includes(hour)) {
        peakRevenue += collectedRevenue;
        peakBookings += 1;
      } else if (offPeakHoursList.includes(hour)) {
        offPeakRevenue += collectedRevenue;
        offPeakBookings += 1;
      }
    });

    // Construct peak vs off-peak object
    const peakVsOffPeak = {
      peak: {
        revenue: peakRevenue,
        bookings: peakBookings,
        percentage: totalRevenue > 0 ? (peakRevenue / totalRevenue) * 100 : 0,
        hours: "6am-9am & 3pm-9pm", // Updated label
      },
      offPeak: {
        revenue: offPeakRevenue,
        bookings: offPeakBookings,
        percentage:
          totalRevenue > 0 ? (offPeakRevenue / totalRevenue) * 100 : 0,
        hours: "10am-2pm", // Updated label
      },
    };

    console.log("📊 Peak vs Off-Peak:", peakVsOffPeak);

    // Prepare response data
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
      console.log("📊 Cached analytics data for 5 minutes:", cacheKey);
    } catch (cacheError) {
      console.error("📊 Cache write error:", cacheError);
      // Don't fail the request if caching fails
    }

    // Return analytics data after caching
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

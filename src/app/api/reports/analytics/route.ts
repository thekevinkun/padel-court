import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { RevenueData } from "@/types/reports";

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

    console.log("📊 Analytics request:", { startDate, endDate, period });

    // Fetch all bookings in date range
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        courts (name),
        venue_payments (*)
      `
      )
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("status", "PAID");

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    console.log("📊 Found bookings:", bookings.length);

    // Calculate Summary Statistics
    const totalBookings = bookings.length;

    // Online revenue (deposits + full payments, excluding fees)
    const onlineRevenue = bookings.reduce((sum, b) => {
      return sum + (b.require_deposit ? b.deposit_amount : b.subtotal);
    }, 0);

    // Venue revenue (cash collected at venue)
    const venueRevenue = bookings.reduce((sum, b) => {
      return sum + (b.venue_payment_amount || 0);
    }, 0);

    // Total revenue = actual booking value (subtotal)
    const totalRevenue = bookings.reduce((sum, b) => sum + b.subtotal, 0);

    // Net revenue = what actually received (after Midtrans fees)
    const netRevenue = bookings.reduce((sum, b) => {
      const onlineNet = b.total_amount - b.payment_fee;
      const venueNet = b.venue_payment_amount || 0;
      return sum + onlineNet + venueNet;
    }, 0);

    // Total fees absorbed
    const totalFeesAbsorbed = bookings.reduce(
      (sum, b) => sum + b.payment_fee,
      0
    );

    // Average booking value
    const averageBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Deposit vs Full payment bookings
    const depositBookings = bookings.filter((b) => b.require_deposit).length;
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
    };

    console.log("📊 Summary calculated:", summary);

    // Revenue Timeline (group by date)
    const revenueByDate = bookings.reduce((acc: Record<string, RevenueData>, b) => {
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
      const venue = b.venue_payment_amount || 0;
      const onlineNet = b.total_amount - b.payment_fee;

      acc[date].onlineRevenue += online;
      acc[date].venueRevenue += venue;
      acc[date].totalRevenue += b.subtotal;
      acc[date].netRevenue += onlineNet + venue;
      acc[date].feesAbsorbed += b.payment_fee;

      return acc;
    }, {});

    const revenueTimeline = Object.values(revenueByDate).sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    // Payment Methods Breakdown - FIXED VERSION
    const paymentMethodsMap = bookings.reduce((acc: Record<string, { count: number; amount: number }>, b) => {
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
    }, {});

    const totalAmount = Object.values(paymentMethodsMap).reduce(
      (sum: number, m) => sum + m.amount,
      0
    );

    console.log("💳 Payment Methods Map:", paymentMethodsMap);
    console.log("💳 Total Amount for percentages:", totalAmount);

    const paymentMethods = Object.entries(paymentMethodsMap).map(
      ([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      })
    );

    console.log("💳 Final Payment Methods:", paymentMethods);

    // Top Performing Courts
    const courtStats = bookings.reduce((acc: Record<string, { bookings: number; revenue: number }>, b) => {
      const courtName = b.courts?.name || "Unknown";

      if (!acc[courtName]) {
        acc[courtName] = { bookings: 0, revenue: 0 };
      }
      acc[courtName].bookings += 1;
      acc[courtName].revenue += b.subtotal;

      return acc;
    }, {});

    const topCourts = Object.entries(courtStats)
      .map(([courtName, stats]) => ({
        courtName,
        bookings: stats.bookings,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Peak Hours Analysis
    const hourStats = bookings.reduce((acc: Record<string, number>, b) => {
      // Extract hour from time (e.g., "14:00 - 15:00" -> "14:00")
      const hour = b.time.split(" - ")[0];
      if (!acc[hour]) {
        acc[hour] = 0;
      }
      acc[hour] += 1;
      return acc;
    }, {});

    const peakHours = Object.entries(hourStats)
      .map(([hour, bookings]) => ({ hour, bookings: bookings as number }))
      .sort((a, b) => b.bookings - a.bookings);

    // Return analytics data
    return NextResponse.json({
      success: true,
      period,
      startDate,
      endDate,
      summary,
      revenueTimeline,
      paymentMethods,
      topCourts,
      peakHours,
    });
  } catch (error) {
    console.error("❌ Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

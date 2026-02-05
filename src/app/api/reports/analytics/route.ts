import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { RevenueData } from "@/types/reports";

// Cache TTL: 5 minute for reports
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

    // FETCH CURRENT PERIOD BOOKINGS - Include ALL statuses
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
    *,
    courts (name),
    venue_payments (*),
    booking_equipment (
      id,
      quantity,
      subtotal,
      equipment (id, name, category)
    ),
    booking_players (
      id,
      player_name,
      is_primary_booker
    )
  `,
      )
      .gte("date", startDate)
      .lte("date", endDate)
      .in("status", ["PAID", "REFUNDED", "CANCELLED", "EXPIRED"]);

    if (bookingsError) {
      console.error("❌ Bookings fetch error:", bookingsError);
      throw bookingsError;
    }

    console.log("📊 Found current bookings:", bookings.length);

    // PROCESS BOOKINGS - Calculate actual money flow for each booking
    const processedBookings = bookings.map((b) => {
      // Determine if session actually happened
      const isOngoing = b.session_status === "UPCOMING";
      const isCompleted =
        b.session_status === "COMPLETED" || b.session_status === "IN_PROGRESS";
      const isCancelled = b.session_status === "CANCELLED";

      // How much did customer pay online? (only if they actually paid)
      let onlinePaid = 0;
      if (b.status === "PAID" || b.status === "REFUNDED") {
        onlinePaid = b.require_deposit ? b.deposit_amount : b.total_amount;
      }
      // If status is CANCELLED or EXPIRED without payment, onlinePaid stays 0

      // How much was refunded?
      const refunded = parseFloat(b.refund_amount || "0");

      // How much online money did we keep? (regardless of completion)
      const onlineKept = onlinePaid - refunded;

      // Venue payment (only if received)
      const venueKept = b.venue_payment_received
        ? b.venue_payment_amount || 0
        : 0;

      // Total revenue from this booking
      const totalKept = onlineKept + venueKept;

      // Equipment revenue (from database)
      const equipmentSubtotal = parseFloat(b.equipment_subtotal || "0");

      // Court revenue (subtotal minus equipment)
      const courtSubtotal = b.subtotal - equipmentSubtotal;

      // Calculate equipment/court revenue split
      let equipmentRevenue = 0;
      let courtRevenue = 0;

      if (isCompleted) {
        // Session happened - count actual equipment and court revenue
        equipmentRevenue = equipmentSubtotal;
        courtRevenue = courtSubtotal;
      } else if (totalKept > 0) {
        // Session cancelled but we kept money - it's all court revenue (cancellation penalty)
        equipmentRevenue = 0;
        courtRevenue = totalKept;
      }

      // Payment fee (counted for ALL bookings that had payment, even cancelled - Option 1: court absorbs)
      const fee = b.payment_fee || 0;

      return {
        ...b,
        onlineKept,
        venueKept,
        totalKept,
        refunded,
        fee,
        hasRevenue: totalKept > 0,
        equipmentRevenue,
        courtRevenue,
        isOngoing,
        isCompleted,
        isCancelled,
      };
    });

    console.log("📊 Processed bookings:", {
      total: processedBookings.length,
      ongoing: processedBookings.filter((b) => b.isOngoing).length,
      completed: processedBookings.filter((b) => b.isCompleted).length,
      cancelled: processedBookings.filter((b) => b.isCancelled).length,
      withRevenue: processedBookings.filter((b) => b.hasRevenue).length,
      refunded: processedBookings.filter((b) => b.refunded > 0).length,
    });

    // Separate bookings by status
    const ongoingBookings = processedBookings.filter((b) => b.isOngoing);
    const completedBookings = processedBookings.filter((b) => b.isCompleted);
    const cancelledBookings = processedBookings.filter((b) => b.isCancelled);
    const revenueBookings = processedBookings.filter((b) => b.hasRevenue);

    // SUMMARY CALCULATIONS
    // Total Bookings = ALL bookings attempted (PAID, REFUNDED, CANCELLED, EXPIRED)
    const totalBookings = processedBookings.length;

    // Ongoing Bookings = Sessions that neither completed nor cancelled, BUT PAID (UPCOMING)
    const totalOngoingBookings = ongoingBookings.length;

    // Completed Bookings = Sessions that actually happened
    const totalCompletedBookings = completedBookings.length;

    // Cancelled Bookings = Sessions that didn't happen
    const totalCancelledBookings = cancelledBookings.length;

    // Revenue Contributing Bookings = Bookings that kept money (same as completed in most cases)
    const revenueContributingBookings = revenueBookings.length;

    // Ongoing bookings revenue (sessions not yet happened but paid)
    const ongoingRevenue = ongoingBookings.reduce(
      (sum, b) => sum + b.totalKept,
      0,
    );

    // Gross Revenue = Total money kept (from ALL bookings, regardless of completion)
    const totalRevenue = processedBookings.reduce(
      (sum, b) => sum + b.totalKept,
      0,
    );

    // Online Revenue = Money kept from online payments (all bookings)
    const onlineRevenue = processedBookings.reduce(
      (sum, b) => sum + b.onlineKept,
      0,
    );

    // Venue Revenue = Money kept from venue payments (all bookings)
    const venueRevenue = processedBookings.reduce(
      (sum, b) => sum + b.venueKept,
      0,
    );

    // Total Fees = ALL fees paid (including cancelled bookings - Option 1: court absorbs)
    const totalFeesAbsorbed = processedBookings.reduce(
      (sum, b) => sum + b.fee,
      0,
    );

    // Net Revenue = Total revenue minus fees
    const netRevenue = totalRevenue - totalFeesAbsorbed;

    // Actual Earnings = Net Revenue (same thing now, refunds already accounted for)
    const netRevenueAfterRefunds = netRevenue;

    // Average Booking Value (revenue from completed sessions / number of completed sessions)
    const completedRevenue = completedBookings.reduce(
      (sum, b) => sum + b.totalKept,
      0,
    );
    const averageBookingValue =
      totalCompletedBookings > 0
        ? completedRevenue / totalCompletedBookings
        : 0;

    // Deposit vs Full Payment (count ALL bookings, not just revenue ones)
    const depositBookings = processedBookings.filter(
      (b) => b.require_deposit,
    ).length;
    const fullPaymentBookings = processedBookings.filter(
      (b) => !b.require_deposit,
    ).length;

    // Refund Statistics
    const refundedBookings = processedBookings.filter((b) => {
      const refundAmount = parseFloat(b.refund_amount || "0");
      return refundAmount > 0;
    });

    const totalRefunds = refundedBookings.length;
    const totalRefundAmount = refundedBookings.reduce(
      (sum, b) => sum + parseFloat(b.refund_amount || "0"),
      0,
    );

    // Full vs Partial refunds
    // Full refund = Got money back AND kept nothing (totalKept = 0)
    const fullRefunds = refundedBookings.filter((b) => {
      const refundAmount = parseFloat(b.refund_amount || "0");
      const onlinePaid = b.require_deposit ? b.deposit_amount : b.total_amount;
      // Full refund means refund amount equals what they paid
      return refundAmount >= onlinePaid;
    }).length;

    // Partial refund = Got money back BUT kept some (totalKept > 0)
    const partialRefunds = refundedBookings.filter((b) => {
      const refundAmount = parseFloat(b.refund_amount || "0");
      const onlinePaid = b.require_deposit ? b.deposit_amount : b.total_amount;
      // Partial refund means refund amount is less than what they paid
      return refundAmount > 0 && refundAmount < onlinePaid;
    }).length;

    // Equipment Statistics (from all bookings with revenue)
    const equipmentRevenue = processedBookings.reduce(
      (sum, b) => sum + (b.equipmentRevenue || 0),
      0,
    );
    const courtRevenue = processedBookings.reduce(
      (sum, b) => sum + (b.courtRevenue || 0),
      0,
    );
    // Equipment adoption rate (from ALL bookings to show trend)
    const bookingsWithEquipment = processedBookings.filter(
      (b) => b.has_equipment_rental,
    ).length;
    const equipmentRentalRate =
      totalBookings > 0 ? (bookingsWithEquipment / totalBookings) * 100 : 0;

    // Also track completed sessions with equipment
    const completedWithEquipment = completedBookings.filter(
      (b) => b.has_equipment_rental,
    ).length;

    // Player Statistics (ONLY count completed bookings)
    const totalPlayers = completedBookings.reduce(
      (sum, b) => sum + (b.number_of_players || 0),
      0,
    );
    const averagePlayersPerBooking =
      totalCompletedBookings > 0 ? totalPlayers / totalCompletedBookings : 0;

    // Calculate most common player count (MODE)
    const playerCountFrequency: Record<number, number> = {};
    completedBookings.forEach((b) => {
      const count = b.number_of_players || 0;
      playerCountFrequency[count] = (playerCountFrequency[count] || 0) + 1;
    });

    // Find the maximum frequency
    const maxFrequency = Math.max(...Object.values(playerCountFrequency));

    // Get all player counts that have this maximum frequency (handles ties)
    const mostCommonCounts = Object.entries(playerCountFrequency)
      .filter(([_, freq]) => freq === maxFrequency)
      .map(([count, _]) => parseInt(count))
      .sort((a, b) => a - b); // Sort numerically ascending

    // Format as "3-4" if tie, or "3" if single value
    const mostCommonPlayerCount =
      mostCommonCounts.length > 1
        ? `${mostCommonCounts[0]}-${mostCommonCounts[mostCommonCounts.length - 1]}`
        : mostCommonCounts[0]?.toString() || "0";

    const summary = {
      totalRevenue,
      netRevenue,
      onlineRevenue,
      venueRevenue,
      totalFeesAbsorbed,
      totalBookings,
      totalOngoingBookings,
      totalCompletedBookings,
      totalCancelledBookings,
      revenueContributingBookings,
      averageBookingValue,
      depositBookings,
      fullPaymentBookings,
      totalRefunds,
      totalRefundAmount,
      fullRefunds,
      partialRefunds,
      netRevenueAfterRefunds,
      equipmentRevenue,
      courtRevenue,
      bookingsWithEquipment,
      completedWithEquipment,
      equipmentRentalRate,
      totalPlayers,
      averagePlayersPerBooking,
      mostCommonPlayerCount,
    };

    console.log("📊 Summary:", summary);

    // PREVIOUS PERIOD FOR COMPARISON
    const { data: previousBookings } = await supabase
      .from("bookings")
      .select("*")
      .gte("date", previousStartDate)
      .lte("date", previousEndDate)
      .in("status", ["PAID", "REFUNDED", "CANCELLED", "EXPIRED"]);

    // Process previous period bookings
    const prevProcessed = (previousBookings || []).map((b) => {
      // How much did customer pay online? (only if they actually paid)
      // If status is CANCELLED or EXPIRED without payment, onlinePaid stays 0
      let onlinePaid = 0;
      if (b.status === "PAID" || b.status === "REFUNDED") {
        onlinePaid = b.require_deposit ? b.deposit_amount : b.total_amount;
      }
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
      // Current values
      current: {
        totalRevenue,
        netRevenueAfterRefunds,
        totalBookings,
        totalRefunds,
      },
      // Previous values
      previous: {
        totalRevenue: prevTotalRevenue,
        netRevenueAfterRefunds: prevNetRevenueAfterRefunds,
        totalBookings: prevTotalBookings,
        totalRefunds: prevTotalRefunds,
      },
      // Percentage changes
      changes: {
        totalRevenue: calculateChange(totalRevenue, prevTotalRevenue),
        netRevenueAfterRefunds: calculateChange(
          netRevenueAfterRefunds,
          prevNetRevenueAfterRefunds,
        ),
        totalBookings: calculateChange(totalBookings, prevTotalBookings),
        totalRefunds: calculateChange(totalRefunds, prevTotalRefunds),
      },
    };

    console.log("📊 Comparison:", comparison);

    // REVENUE TIMELINE (group by date) - All bookings with revenue
    const revenueBookingsWithRevenue = processedBookings.filter(
      (b) => b.hasRevenue,
    );
    const revenueByDate = revenueBookingsWithRevenue.reduce(
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
            equipmentRevenue: 0,
            courtRevenue: 0,
          };
        }
        acc[date].onlineRevenue += b.onlineKept;
        acc[date].venueRevenue += b.venueKept;
        acc[date].totalRevenue += b.totalKept;
        acc[date].netRevenue += b.totalKept - b.fee;
        acc[date].feesAbsorbed += b.fee;
        acc[date].equipmentRevenue += b.equipmentRevenue || 0;
        acc[date].courtRevenue += b.courtRevenue || 0;
        return acc;
      },
      {},
    );
    const revenueTimeline = Object.values(revenueByDate).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // PAYMENT METHODS (count money we kept from ALL bookings with revenue)
    const paymentMethodsMap = processedBookings
      .filter((b) => b.hasRevenue)
      .reduce((acc: Record<string, { count: number; amount: number }>, b) => {
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
      }, {});
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

    // TOP COURTS (revenue from ALL bookings that kept money)
    const courtStats = processedBookings
      .filter((b) => b.hasRevenue)
      .reduce(
        (acc: Record<string, { bookings: number; revenue: number }>, b) => {
          const courtName = b.courts?.name || "Unknown Court";
          if (!acc[courtName]) {
            acc[courtName] = { bookings: 0, revenue: 0 };
          }
          acc[courtName].bookings += 1;
          acc[courtName].revenue += b.totalKept;
          return acc;
        },
        {},
      );

    // Calculate utilization rate for each court
    const HOURS_PER_DAY = 15;
    const totalDaysInPeriod =
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    const totalAvailableSlots = HOURS_PER_DAY * totalDaysInPeriod;

    const topCourts = Object.entries(courtStats)
      .map(([courtName, stats]) => {
        const courtBookingsWithRevenue = processedBookings.filter(
          (b) =>
            b.hasRevenue && (b.courts?.name || "Unknown Court") === courtName,
        );

        const totalHoursBooked = courtBookingsWithRevenue.reduce((sum, b) => {
          const [startTime] = b.time.split(" - ");
          const [endTime] = b.time.split(" - ")[1]?.split(" ") || [""];
          const start = parseInt(startTime.split(":")[0]);
          const end = parseInt(endTime.split(":")[0]);
          const duration = end - start;
          return sum + duration;
        }, 0);

        const utilizationRate = (totalHoursBooked / totalAvailableSlots) * 100;

        return {
          courtName,
          bookings: stats.bookings,
          revenue: stats.revenue,
          hoursBooked: totalHoursBooked,
          utilizationRate: Math.min(utilizationRate, 100),
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const bestCourt = topCourts.length > 0 ? topCourts[0] : null;
    const worstCourt =
      topCourts.length > 1 ? topCourts[topCourts.length - 1] : null;

    // EQUIPMENT ANALYSIS (ONLY COMPLETED sessions)
    const equipmentStats = completedBookings.reduce(
      (
        acc: Record<
          string,
          { name: string; quantity: number; revenue: number; bookings: number }
        >,
        b,
      ) => {
        if (b.booking_equipment && b.booking_equipment.length > 0) {
          b.booking_equipment.forEach((item: any) => {
            const equipId = item.equipment?.id || "unknown";
            const equipName = item.equipment?.name || "Unknown Equipment";
            if (!acc[equipId]) {
              acc[equipId] = {
                name: equipName,
                quantity: 0,
                revenue: 0,
                bookings: 0,
              };
            }
            acc[equipId].quantity += item.quantity;
            acc[equipId].revenue += item.subtotal;
            acc[equipId].bookings += 1;
          });
        }
        return acc;
      },
      {},
    );
    const equipmentBreakdown = Object.values(equipmentStats).sort(
      (a, b) => b.revenue - a.revenue,
    );

    // PEAK HOURS ANALYSIS (ONLY COMPLETED sessions)
    const hourStats = completedBookings.reduce(
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

    completedBookings.forEach((b) => {
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

    // DAY OF WEEK ANALYSIS
    const dayOfWeekStats = completedBookings.reduce(
      (
        acc: Record<
          string,
          { bookings: number; revenue: number; hours: number }
        >,
        b,
      ) => {
        const dayOfWeek = new Date(b.date).toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (!acc[dayOfWeek]) {
          acc[dayOfWeek] = { bookings: 0, revenue: 0, hours: 0 };
        }

        acc[dayOfWeek].bookings += 1;
        acc[dayOfWeek].revenue += b.totalKept;

        const [startTime] = b.time.split(" - ");
        const [endTime] = b.time.split(" - ")[1]?.split(" ") || [""];
        const start = parseInt(startTime.split(":")[0]);
        const end = parseInt(endTime.split(":")[0]);
        const duration = end - start;

        acc[dayOfWeek].hours += duration;

        return acc;
      },
      {},
    );

    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dayOfWeekBreakdown = dayOrder
      .map((day) => ({
        day,
        bookings: dayOfWeekStats[day]?.bookings || 0,
        revenue: dayOfWeekStats[day]?.revenue || 0,
        hours: dayOfWeekStats[day]?.hours || 0,
      }))
      .filter((day) => day.bookings > 0);

    // PREPARE RESPONSE
    const responseData = {
      success: true,
      period,
      startDate,
      endDate,
      summary: {
        ...summary,
        ongoingRevenue,
      },
      comparison,
      revenueTimeline,
      paymentMethods,
      topCourts,
      bestCourt,
      worstCourt,
      peakHours,
      peakVsOffPeak,
      equipmentBreakdown,
      dayOfWeekBreakdown,
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

"use client";

import {
  AlertTriangle,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsData } from "@/types/reports";

interface Recommendation {
  type: "warning" | "opportunity" | "success" | "info";
  icon: any;
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
}

const BusinessRecommendations = ({
  analytics,
}: {
  analytics: AnalyticsData;
}) => {
  const { summary, peakVsOffPeak, topCourts } = analytics;

  const recommendations: Recommendation[] = [];

  // CANCELLATION RATE CHECK
  const cancellationRate =
    (summary.totalCancelledBookings / summary.totalBookings) * 100;
  if (cancellationRate > 30) {
    recommendations.push({
      type: "warning",
      icon: AlertTriangle,
      title: `${cancellationRate.toFixed(0)}% cancellation rate is high`,
      description: `${summary.totalCancelledBookings} out of ${summary.totalBookings} bookings were cancelled. This impacts revenue predictability.`,
      action:
        cancellationRate > 40
          ? "Consider stricter cancellation policy or require full deposit instead of partial"
          : "Monitor cancellation reasons and consider requiring deposits for all bookings",
      priority: cancellationRate > 40 ? "high" : "medium",
    });
  }

  // COMPLETION RATE CHECK
  const completionRate =
    (summary.totalCompletedBookings / summary.totalBookings) * 100;
  if (completionRate < 70 && completionRate >= 50) {
    recommendations.push({
      type: "warning",
      icon: AlertTriangle,
      title: `${completionRate.toFixed(0)}% completion rate is below industry average`,
      description:
        "Industry standard is 65-75%. Low completion means lost court time that could be rebooked.",
      action:
        "Send reminder notifications 24h before sessions and implement late cancellation fees",
      priority: "medium",
    });
  } else if (completionRate >= 80) {
    recommendations.push({
      type: "success",
      icon: CheckCircle,
      title: `${completionRate.toFixed(0)}% completion rate - excellent!`,
      description:
        "Your booking reliability is above industry average (65-75%).",
      action: "Maintain current policies and customer communication practices",
      priority: "low",
    });
  }

  // OFF-PEAK UTILIZATION
  if (peakVsOffPeak) {
    const offPeakPercentage = peakVsOffPeak.offPeak.percentage;
    if (offPeakPercentage < 20) {
      recommendations.push({
        type: "opportunity",
        icon: Clock,
        title: `Off-peak hours (${peakVsOffPeak.offPeak.hours}) only ${offPeakPercentage.toFixed(1)}% utilized`,
        description: `Only ${peakVsOffPeak.offPeak.bookings} bookings during off-peak vs ${peakVsOffPeak.peak.bookings} during peak hours.`,
        action:
          "Launch 20-30% discount for midday bookings or introduce corporate packages for daytime slots",
        priority: "high",
      });
    }
  }

  // EQUIPMENT RENTAL PERFORMANCE
  if (summary.equipmentRentalRate > 75) {
    recommendations.push({
      type: "opportunity",
      icon: TrendingUp,
      title: `Equipment rental at ${summary.equipmentRentalRate.toFixed(1)}% - strong adoption`,
      description: `${summary.bookingsWithEquipment} out of ${summary.totalBookings} bookings include equipment rental.`,
      action:
        "High demand detected! Consider adding premium racket tier or padel ball packages for extra revenue",
      priority: "medium",
    });
  } else if (summary.equipmentRentalRate < 30) {
    recommendations.push({
      type: "info",
      icon: Lightbulb,
      title: `Equipment rental at ${summary.equipmentRentalRate.toFixed(1)}% - growth opportunity`,
      description: "Most customers bring their own equipment.",
      action:
        "Market rental equipment better on booking page or offer first-time rental discount",
      priority: "low",
    });
  }

  // COURT PERFORMANCE ANALYSIS
  if (topCourts && topCourts.length >= 2) {
    const worstCourt = topCourts[topCourts.length - 1];
    const bestCourt = topCourts[0];

    const avgRevenue = worstCourt.revenue / worstCourt.bookings;
    const bestAvgRevenue = bestCourt.revenue / bestCourt.bookings;

    // Check if worst court is significantly underperforming
    if (avgRevenue < bestAvgRevenue * 0.6) {
      recommendations.push({
        type: "warning",
        icon: AlertTriangle,
        title: `${worstCourt.courtName} underperforming`,
        description: `Average revenue IDR ${Math.round(avgRevenue).toLocaleString("id-ID")}/booking vs ${bestCourt.courtName} at IDR ${Math.round(bestAvgRevenue).toLocaleString("id-ID")}/booking.`,
        action:
          "Inspect court quality (lighting, surface, nets). Consider price adjustment or maintenance",
        priority: "medium",
      });
    }

    // Check utilization rates
    const lowUtilCourts = topCourts.filter((c) => c.utilizationRate < 30);
    if (lowUtilCourts.length > 0) {
      recommendations.push({
        type: "info",
        icon: Target,
        title: `${lowUtilCourts.length} court${lowUtilCourts.length > 1 ? "s" : ""} with low utilization`,
        description: lowUtilCourts
          .map((c) => `${c.courtName} (${c.utilizationRate.toFixed(0)}%)`)
          .join(", "),
        action:
          "Focus marketing on underutilized courts or consider dynamic pricing during slow periods",
        priority: "medium",
      });
    }
  }

  // REFUND IMPACT
  const refundImpact =
    ((summary.totalRefundAmount || 0) /
      ((summary.totalRevenue || 1) + (summary.totalRefundAmount || 0))) *
    100;
  if (refundImpact > 15) {
    recommendations.push({
      type: "warning",
      icon: AlertTriangle,
      title: `Refunds impacting ${refundImpact.toFixed(1)}% of potential revenue`,
      description: `IDR ${(summary.totalRefundAmount || 0).toLocaleString("id-ID")} refunded across ${summary.totalRefunds || 0} cancelled bookings.`,
      action:
        "Review cancellation policy - consider non-refundable deposits or shorter cancellation windows",
      priority: "high",
    });
  }

  // AVERAGE BOOKING VALUE
  if (summary.averageBookingValue < 500000) {
    recommendations.push({
      type: "opportunity",
      icon: TrendingUp,
      title: "Average booking value could be higher",
      description: `Current average: IDR ${Math.round(summary.averageBookingValue).toLocaleString("id-ID")}/booking`,
      action:
        "Encourage longer session bookings (2-3 hours) or bundle deals with equipment rental",
      priority: "low",
    });
  }

  // PAYMENT FEE OPTIMIZATION
  const feePercentage =
    (summary.totalFeesAbsorbed / summary.onlineRevenue) * 100;
  if (feePercentage > 3) {
    recommendations.push({
      type: "info",
      icon: Lightbulb,
      title: `Payment fees at ${feePercentage.toFixed(2)}% of online revenue`,
      description: `IDR ${summary.totalFeesAbsorbed.toLocaleString("id-ID")} paid in processing fees.`,
      action:
        "Consider incentivizing bank transfer or QRIS (lower fees) vs credit cards",
      priority: "low",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  const sortedRecommendations = recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );

  if (sortedRecommendations.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">
            All Systems Looking Good! 🎉
          </h3>
          <p className="text-green-700">
            Your business metrics are healthy. Keep up the great work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Business Recommendations
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered insights based on your performance data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedRecommendations.map((rec, index) => {
          const Icon = rec.icon;
          const colors = {
            warning: {
              bg: "bg-red-50",
              border: "border-red-200",
              icon: "text-red-600",
              title: "text-red-900",
              badge: "bg-red-500",
            },
            opportunity: {
              bg: "bg-blue-50",
              border: "border-blue-200",
              icon: "text-blue-600",
              title: "text-blue-900",
              badge: "bg-blue-500",
            },
            success: {
              bg: "bg-green-50",
              border: "border-green-200",
              icon: "text-green-600",
              title: "text-green-900",
              badge: "bg-green-500",
            },
            info: {
              bg: "bg-amber-50",
              border: "border-amber-200",
              icon: "text-amber-600",
              title: "text-amber-900",
              badge: "bg-amber-500",
            },
          };

          const style = colors[rec.type];

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 bg-white rounded-lg ${style.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-semibold ${style.title}`}>
                      {index + 1}. {rec.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full text-white font-medium ${style.badge}`}
                    >
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {rec.description}
                  </p>
                  <div className="flex items-start gap-2 mt-3 p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-900">→</span>
                    <p className="text-sm font-medium text-gray-900">
                      {rec.action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BusinessRecommendations;

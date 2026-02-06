"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PeriodComparisonProps {
  current: {
    totalRevenue: number;
    netRevenueAfterRefunds: number;
    totalBookings: number;
    totalCompletedBookings: number;
    totalCancelledBookings: number;
    totalRefunds?: number;
    averageBookingValue: number;
    equipmentRentalRate: number;
  };
  previous: {
    totalRevenue: number;
    netRevenueAfterRefunds: number;
    totalBookings: number;
    totalRefunds: number;
  };
  changes: {
    totalRevenue: number;
    netRevenueAfterRefunds: number;
    totalBookings: number;
    totalRefunds: number;
  };
  startDate: string;
  endDate: string;
}

const PeriodComparison = ({
  current,
  previous,
  changes,
  startDate,
  endDate,
}: PeriodComparisonProps) => {
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (change: number, inverse = false) => {
    const isPositive = inverse ? change < 0 : change > 0;
    if (isPositive) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const completionRate =
    (current.totalCompletedBookings / current.totalBookings) * 100;
  const cancellationRate =
    (current.totalCancelledBookings / current.totalBookings) * 100;

  const rows = [
    {
      metric: "Gross Revenue",
      current: `IDR ${current.totalRevenue.toLocaleString("id-ID")}`,
      previous: `IDR ${previous.totalRevenue.toLocaleString("id-ID")}`,
      change: changes.totalRevenue,
      inverse: false,
    },
    {
      metric: "Actual Earnings",
      current: `IDR ${(current.netRevenueAfterRefunds || 0).toLocaleString("id-ID")}`,
      previous: `IDR ${previous.netRevenueAfterRefunds.toLocaleString("id-ID")}`,
      change: changes.netRevenueAfterRefunds,
      inverse: false,
    },
    {
      metric: "Total Bookings",
      current: current.totalBookings,
      previous: previous.totalBookings,
      change: changes.totalBookings,
      inverse: false,
    },
    {
      metric: "Completed Sessions",
      current: current.totalCompletedBookings,
      previous: "-",
      change: null,
      inverse: false,
    },
    {
      metric: "Completion Rate",
      current: `${completionRate.toFixed(1)}%`,
      previous: "-",
      change: null,
      inverse: false,
    },
    {
      metric: "Cancellations",
      current: `${current.totalCancelledBookings} (${cancellationRate.toFixed(0)}%)`,
      previous: "-",
      change: null,
      inverse: true,
    },
    {
      metric: "Refunds Processed",
      current: current.totalRefunds || 0,
      previous: previous.totalRefunds,
      change: changes.totalRefunds,
      inverse: true,
    },
    {
      metric: "Avg Booking Value",
      current: `IDR ${Math.round(current.averageBookingValue).toLocaleString("id-ID")}`,
      previous: "-",
      change: null,
      inverse: false,
    },
    {
      metric: "Equipment Rental Rate",
      current: `${current.equipmentRentalRate.toFixed(1)}%`,
      previous: "-",
      change: null,
      inverse: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-forest" />
          Period Comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Compare current period with previous period of equal length
        </p>
      </CardHeader>
      <CardContent>
        <div className="custom-scrollbar !overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Metric
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Current Period
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Previous Period
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === 0 || index === 1 ? "bg-green-50/30" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {row.metric}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {row.current}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {row.previous}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.change !== null ? (
                      <div className="flex items-center justify-end gap-2">
                        {getTrendIcon(row.change)}
                        <span
                          className={`font-semibold ${getTrendColor(row.change, row.inverse)}`}
                        >
                          {row.change >= 0 ? "+" : ""}
                          {row.change.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Period Labels */}
        <div className="mt-4 text-xs text-gray-500 border-t pt-4">
          <div className="mb-1">
            <span className="font-medium text-gray-700">Current Period:</span>{" "}
            {new Date(startDate).toLocaleDateString("id-ID")} -{" "}
            {new Date(endDate).toLocaleDateString("id-ID")}
          </div>
          {previous.totalBookings === 0 && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
              ⚠️ No bookings found in previous period - comparison limited
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodComparison;

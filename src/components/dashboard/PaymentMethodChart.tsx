"use client";

import { Info } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { PaymentMethodBreakdown } from "@/types/reports";

const PaymentMethodChart = ({ data }: { data: PaymentMethodBreakdown[] }) => {
  // Color mapping: Online methods = Blue shades, Venue methods = Amber shades
  const getColorForMethod = (method: string) => {
    if (method.startsWith("VENUE_")) {
      // Venue payments - Amber shades
      const venueColors = ["#f59e0b", "#fb923c", "#fdba74", "#fcd34d"];
      const venueIndex = [
        "VENUE_CASH",
        "VENUE_DEBIT_CARD",
        "VENUE_BANK_TRANSFER",
        "VENUE_QRIS",
      ].indexOf(method);
      return venueColors[venueIndex] || "#f59e0b";
    } else {
      // Online payments - Blue/Green shades
      const onlineColors = [
        "#3b82f6",
        "#10b981",
        "#8b5cf6",
        "#06b6d4",
        "#ec4899",
      ];
      const onlineIndex = [
        "CREDIT_CARD",
        "BANK_TRANSFER",
        "GOPAY",
        "SHOPEEPAY",
        "DANA",
        "QRIS",
        "OTHER_QRIS",
      ].indexOf(method);
      return onlineColors[onlineIndex] || "#3b82f6";
    }
  };

  // Format payment method names for better display
  const formatMethodName = (method: string) => {
    const methodMap: { [key: string]: string } = {
      CREDIT_CARD: "💳 Credit Card",
      BANK_TRANSFER: "🏦 Bank Transfer",
      GOPAY: "🟢 GoPay",
      SHOPEEPAY: "🟠 ShopeePay",
      DANA: "💙 DANA",
      QRIS: "📱 QRIS",
      OTHER_QRIS: "📱 QRIS Other",
      VENUE_CASH: "💵 Venue Cash",
      VENUE_DEBIT_CARD: "💳 Venue Debit",
      VENUE_BANK_TRANSFER: "🏦 Venue Transfer",
    };
    return methodMap[method] || method;
  };

  // Prepare chart data
  const chartData = data.map((item) => ({
    name: formatMethodName(item.method),
    value: item.amount,
    count: item.count,
    percentage: item.percentage,
  }));

  // Custom label for pie slices
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-900">
                IDR {data.value.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-gray-600">Transactions:</span>
              <span className="font-semibold text-gray-900">{data.count}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-semibold text-gray-900">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => {
          // Find the matching data by name instead of using index
          const data = chartData.find((item) => item.name === entry.value);
          if (!data) return null;

          return (
            <div
              key={`legend-${index}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {entry.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.count} transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">
                  IDR{" "}
                  {data.value.toLocaleString("id-ID", { notation: "compact" })}
                </p>
                <p className="text-xs text-gray-500">
                  {data.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="h-[640px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={140}
              innerRadius={80}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorForMethod(entry.method)}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={renderLegend}
              verticalAlign="bottom"
              wrapperStyle={{ paddingBottom: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">Total Transactions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            IDR{" "}
            {data
              .reduce((sum, item) => sum + item.amount, 0)
              .toLocaleString("id-ID", { notation: "compact" })}
          </p>
          <p className="text-xs text-gray-600 mt-1">Total Amount</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{data.length}</p>
          <p className="text-xs text-gray-600 mt-1">Payment Methods</p>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">
              Understanding Payment Distribution
            </h4>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-0.5 flex-shrink-0"></div>
                <p>
                  <strong>Online Payments (Blue):</strong> Money collected
                  during booking via Midtrans (deposits or full payments)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 mt-0.5 flex-shrink-0"></div>
                <p>
                  <strong>Venue Payments (Amber):</strong> Remaining balance
                  collected in cash at the venue (for deposit bookings only)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodChart;

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
    const colorMap: { [key: string]: string } = {
      // Online - Distinct vibrant colors
      CREDIT_CARD: "#3b82f6", // Blue
      BANK_TRANSFER: "#10b981", // Green
      ECHANNEL: "#3DED97", // Seafoam Green
      QRIS: "#8b5cf6", // Purple
      GOPAY: "#22c55e", // Emerald
      SHOPEEPAY: "#f97316", // Orange
      DANA: "#06b6d4", // Cyan
      OTHER_QRIS: "#a855f7", // Light Purple

      // Venue - Warm tones
      VENUE_CASH: "#f59e0b", // Amber
      VENUE_DEBIT_CARD: "#fb923c", // Orange
      VENUE_BANK_TRANSFER: "#ea580c", // Dark Orange
      VENUE_QRIS: "#fbbf24", // Yellow
    };

    return colorMap[method] || "#6b7280";
  };

  // Format payment method names for better display
  const formatMethodName = (method: string) => {
    const methodMap: { [key: string]: string } = {
      CREDIT_CARD: "💳 Credit Card",
      BANK_TRANSFER: "🏦 Bank Transfer",
      ECHANNEL: "📱 E-Channel",
      GOPAY: "🟢 GoPay",
      SHOPEEPAY: "🟠 ShopeePay",
      DANA: "💙 DANA",
      QRIS: "📱 QRIS",
      OTHER_QRIS: "📱 QRIS Other",
      VENUE_CASH: "💵 Venue Cash",
      VENUE_DEBIT_CARD: "💳 Venue Debit",
      VENUE_BANK_TRANSFER: "🏦 Venue Transfer",
      VENUE_QRIS: "📱 Venue QRIS",
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

    // Separate and sort online vs venue payments by revenue
    const onlinePayments = payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((entry: any) => {
        const data = chartData.find((item) => item.name === entry.value);
        const method = payload.find((p: any) => p.value === entry.value);
        // Check the original method name from the data, not the formatted display name
        return data && !data.name.toUpperCase().includes("VENUE");
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => {
        const dataA = chartData.find((item) => item.name === a.value);
        const dataB = chartData.find((item) => item.name === b.value);
        return (dataB?.value || 0) - (dataA?.value || 0);
      });

    const venuePayments = payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((entry: any) => {
        const data = chartData.find((item) => item.name === entry.value);
        return data && data.name.toUpperCase().includes("VENUE");
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => {
        const dataA = chartData.find((item) => item.name === a.value);
        const dataB = chartData.find((item) => item.name === b.value);
        return (dataB?.value || 0) - (dataA?.value || 0);
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderPaymentItem = (entry: any, index: number) => {
      const data = chartData.find((item) => item.name === entry.value);
      if (!data) return null;

      return (
        <div
          key={`legend-${index}`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            ></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{entry.value}</p>
              <p className="text-xs text-gray-500">{data.count} transactions</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-sm">
              IDR {data.value.toLocaleString("en-ID", { notation: "compact" })}
            </p>
            <p className="text-xs text-gray-500">
              {data.percentage.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Online Payments - Left */}
        <div className="flex flex-col">
          <h4 className="sr-only">
            Online Payments
          </h4>
          <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
            {onlinePayments.map((entry: any, index: number) =>
              renderPaymentItem(entry, index),
            )}
          </div>
        </div>

        {/* Venue Payments - Right */}
        <div className="flex flex-col">
          <h4 className="sr-only">
            Venue Payments
          </h4>
          <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
            {venuePayments.map((entry: any, index: number) =>
              renderPaymentItem(entry, index),
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="h-[720px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={150}
              innerRadius={90}
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
              .toLocaleString("en-ID", { notation: "compact" })}
          </p>
          <p className="text-xs text-gray-600 mt-1">Total Amount</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{data.length}</p>
          <p className="text-xs text-gray-600 mt-1">Payment Methods</p>
        </div>
      </div>

      {/* Explanation Section */}
      {/* <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 mt-0.5 flex-shrink-0"></div>
                <p>
                  <strong>Online Payments:</strong> Money collected during
                  booking via Midtrans (deposits or full payments)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mt-0.5 flex-shrink-0"></div>
                <p>
                  <strong>Venue Payments:</strong> Remaining balance collected
                  in cash at the venue (for deposit bookings only)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PaymentMethodChart;

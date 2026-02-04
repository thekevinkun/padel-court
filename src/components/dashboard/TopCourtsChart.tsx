"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { CourtData } from "@/types/reports";

const TopCourtsChart = ({ data }: { data: CourtData[] }) => {
  // Color gradient for bars
  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

  // Prepare chart data
  const chartData = data.map((item) => ({
    court: item.courtName,
    Bookings: item.bookings,
    Revenue: item.revenue / 1000, // Convert to thousands for better display
  }));

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Bookings:</span>
              </div>
              <span className="font-semibold text-gray-900">
                {payload[0].value}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Revenue:</span>
              </div>
              <span className="font-semibold text-gray-900">
                IDR {(payload[1].value * 1000).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="court"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#3b82f6"
            style={{ fontSize: "12px" }}
            label={{
              value: "Bookings",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: "12px", fill: "#3b82f6" },
            }}
            width={60}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#10b981"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `${value}k`}
            label={{
              value: "Revenue (IDR)",
              angle: 90,
              position: "insideRight",
              style: { fontSize: "12px", fill: "#10b981" },
            }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />

          {/* Bookings Bar - Blue */}
          <Bar
            yAxisId="left"
            dataKey="Bookings"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>

          {/* Revenue Bar - Green */}
          <Bar
            yAxisId="right"
            dataKey="Revenue"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>

      {/* Court Rankings */}
      <div className="mt-6 space-y-3">
        {data.map((court, index) => (
          <div
            key={court.courtName}
            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                #{index + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{court.courtName}</p>
                <p className="text-sm text-gray-500">
                  {court.bookings} bookings
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600 text-lg">
                IDR{" "}
                {court.revenue.toLocaleString("en-ID", { notation: "compact" })}
              </p>
              <p className="text-xs text-gray-500">
                Avg: IDR{" "}
                {Math.round(court.revenue / court.bookings).toLocaleString(
                  "en-ID",
                  {
                    notation: "compact",
                  }
                )}
                /booking
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCourtsChart;

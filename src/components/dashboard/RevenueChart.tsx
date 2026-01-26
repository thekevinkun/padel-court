"use client";

import {
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { RevenueData } from "@/types/reports";

const RevenueChart = ({ data }: { data: RevenueData[] }) => {
  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    }),
    "Online Revenue": item.onlineRevenue,
    "Venue Revenue": item.venueRevenue,
    "Gross Revenue": item.totalRevenue,
    "Actual Earnings": item.netRevenue,
  }));

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-semibold text-gray-900">
                IDR {entry.value.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            height={60}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* <Legend
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "10px",  }}
            iconType="circle"
            verticalAlign="bottom"
          /> */}

          {/* Gross Revenue - Green */}
          <Area
            type="monotone"
            dataKey="Gross Revenue"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />

          {/* Online Revenue - Blue */}
          <Area
            type="monotone"
            dataKey="Online Revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOnline)"
          />

          {/* Venue Revenue - Amber */}
          <Area
            type="monotone"
            dataKey="Venue Revenue"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVenue)"
          />

          {/* Actual Earnings - Emerald (dotted) */}
          <Line
            type="monotone"
            dataKey="Actual Earnings"
            stroke="#059669"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#059669", r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend Info */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-5 text-sm justify-items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div>
            <p className="text-gray-600">Gross Revenue</p>
            <p className="text-xs text-gray-500">What customers paid</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div>
            <p className="text-gray-600">Online Revenue</p>
            <p className="text-xs text-gray-500">Deposits + full</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div>
            <p className="text-gray-600">Venue Revenue</p>
            <p className="text-xs text-gray-500">Cash collected</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
          <div>
            <p className="text-gray-600">Actual Earnings</p>
            <p className="text-xs text-gray-500">After fees & refunds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;

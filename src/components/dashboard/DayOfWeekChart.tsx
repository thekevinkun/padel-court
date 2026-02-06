"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DayOfWeekData } from "@/types/reports";

const DayOfWeekChart = ({ data }: { data: DayOfWeekData[] }) => {
  const getColorForDay = (revenue: number, maxRevenue: number) => {
    const percentage = (revenue / maxRevenue) * 100;
    if (percentage >= 70) return "#10b981";
    if (percentage >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const day = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{day.day}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-gray-600">Bookings:</span>
              <span className="font-semibold text-gray-900">
                {day.bookings}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-semibold text-gray-900">
                IDR {day.revenue.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-gray-600">Hours Booked:</span>
              <span className="font-semibold text-gray-900">{day.hours}h</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-gray-600">Avg/Booking:</span>
              <span className="font-semibold text-gray-900">
                IDR{" "}
                {Math.round(day.revenue / day.bookings).toLocaleString("id-ID")}
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
      <div className="h-[300px] md:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              label={{
                value: "Revenue (IDR)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: "12px" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorForDay(entry.revenue, maxRevenue)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-3">
        {data.map((day) => {
          const performance = (day.revenue / maxRevenue) * 100;
          const isWeekend = day.day === "Saturday" || day.day === "Sunday";

          return (
            <div
              key={day.day}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    isWeekend ? "bg-purple-500" : "bg-blue-500"
                  }`}
                >
                  {day.day.substring(0, 3)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {day.day}
                    {isWeekend && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Weekend
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {day.bookings} bookings · {day.hours} hours
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold text-lg ${
                    performance >= 70
                      ? "text-green-600"
                      : performance >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  IDR {day.revenue.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500">
                  Avg: IDR{" "}
                  {Math.round(day.revenue / day.bookings).toLocaleString(
                    "id-ID",
                  )}
                  /booking
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayOfWeekChart;

"use client";

interface PeakHourData {
  hour: string;
  bookings: number;
  revenue: number;
}

interface PeakHoursChartProps {
  data: PeakHourData[];
}

const PeakHoursChart = ({ data }: PeakHoursChartProps) => {
  // Sort by REVENUE descending (better metric than just bookings)
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = sortedData[0]?.revenue || 1;

  // Helper to get color based on revenue percentage
  const getBarColor = (revenue: number) => {
    const percentage = (revenue / maxRevenue) * 100;
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-emerald-500";
    if (percentage >= 40) return "bg-amber-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = (revenue: number) => {
    const percentage = (revenue / maxRevenue) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-emerald-600";
    if (percentage >= 40) return "text-amber-600";
    if (percentage >= 20) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-3">
      {sortedData.map((hour, index) => {
        const percentage = (hour.revenue / maxRevenue) * 100;
        const isPeak = index === 0;

        return (
          <div
            key={hour.hour}
            className={`p-4 rounded-lg transition-all ${
              isPeak
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {/* Hour and Badge */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900 w-20">
                  {hour.hour}
                </span>
                {isPeak && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    🏆 PEAK
                  </span>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`text-2xl font-bold ${getTextColor(hour.revenue)}`}
                >
                  {hour.bookings}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  booking{hour.bookings !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(hour.revenue)} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
                style={{ width: `${percentage}%` }}
              >
                {percentage > 15 && (
                  <span className="text-xs font-semibold text-white">
                    {percentage.toFixed(0)}%
                  </span>
                )}
              </div>
              {percentage <= 15 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">
                  {percentage.toFixed(0)}%
                </span>
              )}
            </div>

            {/* Revenue Info */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900">
                IDR {hour.revenue.toLocaleString("id-ID")}
              </span>
              <span className="text-gray-600">
                Avg: IDR{" "}
                {Math.round(hour.revenue / hour.bookings).toLocaleString(
                  "id-ID",
                )}
                /booking
              </span>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-3">
          📊 Sorted by Revenue (Highest to Lowest)
        </h4>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">80-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-gray-600">60-79%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-gray-600">40-59%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-600">20-39%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">0-19%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeakHoursChart;

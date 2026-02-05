export interface VenuePayment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: "CASH" | "DEBIT_CARD" | "BANK_TRANSFER" | "QRIS";
  notes: string | null;
  received_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RevenueData {
  date: string;
  onlineRevenue: number;
  venueRevenue: number;
  totalRevenue: number;
  netRevenue: number;
  feesAbsorbed: number;
  equipmentRevenue: number;
  courtRevenue: number;
}

export interface CourtData {
  courtName: string;
  bookings: number;
  revenue: number;
  hoursBooked: number;
  utilizationRate: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface EquipmentBreakdown {
  name: string;
  quantity: number;
  revenue: number;
  bookings: number;
}

interface FinancialSummary {
  totalRevenue: number;
  onlineRevenue: number;
  venueRevenue: number;
  netRevenue: number;
  ongoingRevenue: number;
  totalFeesAbsorbed: number;
  totalBookings: number;
  totalOngoingBookings: number;
  totalCompletedBookings: number;
  totalCancelledBookings: number;
  revenueContributingBookings: number;
  averageBookingValue: number;
  depositBookings: number;
  fullPaymentBookings: number;
  totalRefunds?: number;
  totalRefundAmount?: number;
  fullRefunds: number;
  partialRefunds: number;
  netRevenueAfterRefunds?: number;
  equipmentRevenue: number;
  courtRevenue: number;
  bookingsWithEquipment: number;
  completedWithEquipment: number;
  equipmentRentalRate: number;
  totalPlayers: number;
  averagePlayersPerBooking: number;
  mostCommonPlayerCount: string;
}

export interface DayOfWeekData {
  day: string;
  bookings: number;
  revenue: number;
  hours: number;
}

export interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  summary: FinancialSummary;
  comparison?: {
    current: {
      totalRevenue: number;
      netRevenueAfterRefunds: number;
      totalBookings: number;
      totalRefunds: number;
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
  };
  revenueTimeline: RevenueData[];
  paymentMethods: PaymentMethodBreakdown[];
  topCourts: CourtData[];
  bestCourt?: CourtData | null;
  worstCourt?: CourtData | null;
  peakHours: Array<{
    revenue: number;
    hour: string;
    bookings: number;
  }>;
  peakVsOffPeak?: {
    peak: {
      revenue: number;
      bookings: number;
      percentage: number;
      hours: string;
    };
    offPeak: {
      revenue: number;
      bookings: number;
      percentage: number;
      hours: string;
    };
  };
  equipmentBreakdown: EquipmentBreakdown[];
  dayOfWeekBreakdown: DayOfWeekData[];
}

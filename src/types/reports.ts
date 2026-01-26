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
}

export interface CourtData {
  courtName: string;
  bookings: number;
  revenue: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

interface FinancialSummary {
  totalRevenue: number;
  onlineRevenue: number;
  venueRevenue: number;
  netRevenue: number;
  totalFeesAbsorbed: number;
  totalBookings: number;
  averageBookingValue: number;
  depositBookings: number;
  fullPaymentBookings: number;
  totalRefunds?: number;
  totalRefundAmount?: number;
  netRevenueAfterRefunds?: number;
}

export interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  summary: FinancialSummary;
  comparison?: {
    // ADD THIS
    totalRevenue: number;
    netRevenueAfterRefunds: number;
    totalBookings: number;
    totalRefunds: number;
  };
  revenueTimeline: RevenueData[];
  paymentMethods: PaymentMethodBreakdown[];
  topCourts: CourtData[];
  bestCourt?: CourtData | null;
  worstCourt?: CourtData | null;
  peakHours: Array<{
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
}

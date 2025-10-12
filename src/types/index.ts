export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "refunded";
  created_at: string;
}

export interface Court {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  period: "peak" | "off-peak";
  pricePerPerson: number;
}

export interface BookingFormData {
  courtId?: string;
  slotId?: string;
  date?: Date;
  numberOfPlayers?: number;
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
  paymentMethod?: string;
  agreeTerms?: boolean;
}
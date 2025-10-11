export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Court {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_hour: number;
  is_active: boolean;
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

export interface TimeSlot {
  time: string;
  available: boolean;
}

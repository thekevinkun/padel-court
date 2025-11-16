import { VenuePayment } from "./reports";

export type BookingStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";

export type SessionStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PaymentChoice = "DEPOSIT" | "FULL";

export type VenuePaymentStatus = "PENDING" | "COMPLETED" | "EXPIRED";

export interface Booking {
  // Existing fields
  id: string;
  booking_ref: string;
  court_id: string;
  time_slot_id: string;
  date: string;
  time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp: string;
  number_of_players: number;
  notes: string | null;
  subtotal: number;
  payment_fee: number;
  total_amount: number;
  payment_method: string | null;
  status: BookingStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Deposit fields
  require_deposit: boolean;
  deposit_amount: number;
  full_amount: number;
  remaining_balance: number;
  
  // Venue payment fields
  venue_payment_received: boolean;
  venue_payment_amount: number;
  venue_payment_date: string | null;
  venue_payment_method: string | null;
  
  // Status fields
  session_status: SessionStatus;
  customer_payment_choice: PaymentChoice | null;
  venue_payment_expired: boolean;
  checked_in_at: string | null;
  checked_out_at: string | null;
  session_notes: string | null;
  
  // Relations (when joined)
  courts?: {
    id: string;
    name: string;
    description: string;
    available: boolean;
  };
  
  venue_payments?: VenuePayment[];
}

export interface BookingWithVenuePayment {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  deposit_amount: number;
  remaining_balance: number;
  venue_payment_received: boolean;
  venue_payment_amount: number;
  venue_payment_date: string | null;
  venue_payment_method: string | null;
  venue_payments?: VenuePayment[];
}

export interface BookingFormData {
  courtId?: string;
  slotId?: string;
  date?: Date;
  time?: string;
  numberOfPlayers?: number;
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
  agreeTerms?: boolean;
  // NEW: Payment choice
  paymentChoice?: PaymentChoice;
}
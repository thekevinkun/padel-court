import { VenuePayment } from "./reports";

export type BookingStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

export type SessionStatus =
  | "UPCOMING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentChoice = "DEPOSIT" | "FULL";

export type VenuePaymentStatus = "PENDING" | "COMPLETED" | "EXPIRED";

export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface BookingTimeSlot {
  id: string;
  booking_id: string;
  time_slot_id: string;
  created_at: string;

  // Relations (when joined)
  time_slots?: {
    id: string;
    time_start: string;
    time_end: string;
    period: string;
    price_per_person: number;
    available: boolean;
  };
}

export interface Booking {
  // Existing fields
  id: string;
  booking_ref: string;
  court_id: string;
  duration_hours: number;
  time_start: string;
  time_end: string;
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
  booking_time_slots?: BookingTimeSlot[];
  courts?: {
    id: string;
    name: string;
    description: string;
    available: boolean;
  };
  venue_payments?: VenuePayment[];

  // REFUND FIELDS
  refund_status: RefundStatus;
  refund_amount: number;
  refund_date: string | null;
  refund_reason: string | null;
  refund_method: string | null;
  refunded_by: string | null;
  refund_notes: string | null;

  // Payment URL fields
  payment_url: string | null;
  payment_token: string | null;
  payment_created_at: string | null;

  // Cancellation tracking fields
  cancelled_by: string | null;
  cancelled_reason: string | null;
  cancelled_at: string | null;

  // Equipment rental fields
  equipment_subtotal: number;
  has_equipment_rental: boolean;

  // Relations (when joined)
  booking_equipment?: BookingEquipment[];
  booking_players?: BookingPlayer[];
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
  slotIds?: string[];
  date?: Date;
  time?: string;
  numberOfPlayers?: number;
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
  agreeTerms?: boolean;
  paymentChoice?: PaymentChoice;

  equipmentRentals?: Array<{
    equipmentId: string;
    quantity: number;
    pricePerUnit: number;
  }>;

  additionalPlayers?: Array<{
    name?: string;
    email?: string;
    whatsapp?: string;
  }>;
}

// Equipment types
export interface Equipment {
  id: string;
  name: string;
  category: string;
  price_per_session: number;
  available_quantity: number;
  is_active: boolean;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BookingEquipment {
  id: string;
  booking_id: string;
  equipment_id: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  created_at: string;
  // Relations (when joined)
  equipment?: Equipment;
}

export interface BookingPlayer {
  id: string;
  booking_id: string;
  player_order: number;
  player_name: string;
  player_email: string | null;
  player_whatsapp: string | null;
  is_primary_booker: boolean;
  created_at: string;
}

export interface ReceiptData {
  bookingRef: string;
  customerName: string;
  email: string;
  phone: string;
  courtName: string;
  date: string;
  time: string;
  numberOfPlayers: number;
  pricePerPerson: number;
  subtotal: number;
  paymentMethod: string;
  paymentFee: number;
  total: number;
  notes: string;
  timestamp: string;
  equipmentRentals?: Array<{
    name: string;
    quantity: number;
    subtotal: number;
  }>;
  additionalPlayers?: Array<{
    name: string;
    email?: string;
    whatsapp?: string;
  }>;
}

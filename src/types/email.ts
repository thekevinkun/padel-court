export interface BookingConfirmationEmailProps {
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  courtName: string;
  date: string;
  time: string;
  numberOfPlayers: number;
  totalAmount: number;
  requireDeposit: boolean;
  depositAmount?: number;
  remainingBalance?: number;
  paymentMethod: string;
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
  logoUrl: string;
}

export interface BookingReminderEmailProps {
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  courtName: string;
  date: string;
  time: string;
  requireDeposit: boolean;
  remainingBalance?: number;
  venuePaymentReceived?: boolean;
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
  logoUrl: string;
}

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  courtName: string;
  date: string;
  time: string;
  numberOfPlayers: number;
  totalAmount: number;
  requireDeposit: boolean;
  depositAmount?: number;
  remainingBalance?: number;
  paymentMethod: string;
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

export interface ReminderEmailData {
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  courtName: string;
  date: string;
  time: string;
  requireDeposit: boolean;
  remainingBalance?: number;
  venuePaymentReceived?: boolean;
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

export interface RefundConfirmationEmailProps {
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  courtName: string;
  date: string;
  time: string;
  originalAmount: number;
  refundAmount: number;
  refundMethod: string;
  refundReason: string;
  logoUrl: string;
}

export interface RefundEmailData {
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  courtName: string;
  date: string;
  time: string;
  originalAmount: number;
  refundAmount: number;
  refundMethod: string;
  refundReason: string;
}

export interface CancellationConfirmationEmailProps {
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  courtName: string;
  date: string;
  time: string;
  originalAmount: number;
  refundAmount: number;
  refundEligible: boolean;
  cancellationReason: string;
  hoursBeforeBooking: number;
  logoUrl: string;
}

export interface CancellationEmailData {
  customerName: string;
  customerEmail: string;
  bookingRef: string;
  courtName: string;
  date: string;
  time: string;
  originalAmount: number;
  refundAmount: number;
  refundEligible: boolean;
  cancellationReason: string;
  hoursBeforeBooking: number;
}

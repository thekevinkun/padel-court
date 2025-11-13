/**
 * Midtrans Payment Fee Structure
 * These fees are charged by Midtrans on top of the transaction amount
 */

export type PaymentMethodType =
  | "bank_transfer"
  | "gopay"
  | "qris"
  | "shopeepay"
  | "dana"
  | "credit_card";

export interface PaymentFeeConfig {
  id: PaymentMethodType;
  name: string;
  icon: string; // For UI display
  feeType: "flat" | "percentage" | "mixed";
  flatFee?: number; // Fixed IDR amount
  percentageFee?: number; // Percentage (e.g., 2 for 2%)
  description: string;
  midtransCode: string; // Midtrans payment code for enabled_payments
}

export const PAYMENT_FEES: Record<PaymentMethodType, PaymentFeeConfig> = {
  bank_transfer: {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: "Building2",
    feeType: "flat",
    flatFee: 4000,
    description: "BCA, BNI, BRI, Mandiri, Permata",
    midtransCode: "bank_transfer",
  },
  gopay: {
    id: "gopay",
    name: "GoPay",
    icon: "Smartphone",
    feeType: "percentage",
    percentageFee: 2,
    description: "Pay with GoPay e-wallet",
    midtransCode: "gopay",
  },
  qris: {
    id: "qris",
    name: "QRIS",
    icon: "QrCode",
    feeType: "percentage",
    percentageFee: 0.7,
    description: "Scan to pay with any e-wallet",
    midtransCode: "other_qris",
  },
  shopeepay: {
    id: "shopeepay",
    name: "ShopeePay",
    icon: "Smartphone",
    feeType: "percentage",
    percentageFee: 2,
    description: "Pay with ShopeePay",
    midtransCode: "shopeepay",
  },
  dana: {
    id: "dana",
    name: "DANA",
    icon: "Smartphone",
    feeType: "percentage",
    percentageFee: 1.5,
    description: "Pay with DANA e-wallet",
    midtransCode: "dana",
  },
  credit_card: {
    id: "credit_card",
    name: "Credit/Debit Card",
    icon: "CreditCard",
    feeType: "mixed",
    percentageFee: 2.9,
    flatFee: 2000,
    description: "Visa, MasterCard, JCB",
    midtransCode: "credit_card",
  },
};

/**
 * Calculate payment fee for a given amount and method
 */
export function calculatePaymentFee(
  amount: number,
  method: PaymentMethodType
): number {
  const config = PAYMENT_FEES[method];

  if (!config) return 0;

  let fee = 0;

  if (config.feeType === "flat") {
    fee = config.flatFee || 0;
  } else if (config.feeType === "percentage") {
    fee = Math.round((amount * (config.percentageFee || 0)) / 100);
  } else if (config.feeType === "mixed") {
    fee =
      Math.round((amount * (config.percentageFee || 0)) / 100) +
      (config.flatFee || 0);
  }

  return fee;
}

/**
 * Format fee for display
 */
export function formatFeeDisplay(method: PaymentMethodType): string {
  const config = PAYMENT_FEES[method];

  if (config.feeType === "flat") {
    return `+IDR ${config.flatFee?.toLocaleString("id-ID")}`;
  } else if (config.feeType === "percentage") {
    return `+${config.percentageFee}%`;
  } else if (config.feeType === "mixed") {
    return `+${config.percentageFee}% + IDR ${config.flatFee?.toLocaleString(
      "id-ID"
    )}`;
  }

  return "";
}

/**
 * Get available payment methods based on settings
 */
export function getAvailablePaymentMethods(settings: any): PaymentMethodType[] {
  const available: PaymentMethodType[] = [];

  if (settings?.payment_settings?.enable_bank_transfer) {
    available.push("bank_transfer");
  }
  if (settings?.payment_settings?.enable_qris) {
    available.push("qris");
  }
  if (settings?.payment_settings?.enable_credit_card) {
    available.push("credit_card");
  }
  
  // if (settings?.payment_settings?.enable_ewallet) {
  //   available.push("gopay", "shopeepay", "dana");
  // }

  return available;
}

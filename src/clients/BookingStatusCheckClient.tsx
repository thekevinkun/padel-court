"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const BookingStatusCheckClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  const orderId = searchParams.get("order_id"); // Get from Midtrans redirect

  if (!orderId) {
    console.error("❌ No order_id found in URL");
  }

  // Clean booking ref
  const cleanBookingRef = orderId?.startsWith("BOOKING-")
    ? orderId.replace("BOOKING-", "")
    : orderId;

  useEffect(() => {
    checkPaymentStatus();
  }, [cleanBookingRef]);

  const checkPaymentStatus = async () => {
    try {
      console.log("🔍 Checking payment status for:", cleanBookingRef);

      const response = await fetch("/api/payments/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingRef: cleanBookingRef }),
      });

      const data = await response.json();

      console.log("📊 Payment status:", data.status);

      // Redirect based on actual payment status
      if (data.status === "PAID") {
        console.log("✅ Payment successful, redirecting to success page");
        router.push(`/booking/success/${cleanBookingRef}`);
      } else {
        // PENDING, CANCELLED, EXPIRED, FAILED
        console.log("❌ Payment not successful, redirecting to failed page");
        router.push(
          `/booking/failed?order_id=BOOKING-${cleanBookingRef}&status_code=${data.transactionStatus || "UNKNOWN"}`,
        );
      }
    } catch (error) {
      console.error("❌ Error checking status:", error);
      // On error, safer to redirect to failed page
      router.push(`/booking/failed?order_id=BOOKING-${cleanBookingRef}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest/5 to-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-forest mx-auto mb-4" />
        <p className="text-lg font-semibold">Verifying Payment Status...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please wait while we confirm your payment
        </p>
      </div>
    </div>
  );
};

export default BookingStatusCheckClient;

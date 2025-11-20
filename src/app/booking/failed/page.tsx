"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, Home, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BookingFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get booking ref from URL parameters
  const orderId = searchParams.get("order_id");
  const statusCode = searchParams.get("status_code");
  const bookingRef = orderId?.replace("BOOKING-", "");

  const [updating, setUpdating] = useState(true);
  const [updateComplete, setUpdateComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Immediately cancel booking when failed page loads
  useEffect(() => {
    if (bookingRef) {
      cancelFailedBooking();
    } else {
      setUpdating(false);
    }
  }, [bookingRef]);

  const cancelFailedBooking = async () => {
    try {
      setUpdating(true);
      console.log("Cancelling failed booking:", bookingRef);

      // Call our new cancel API that doesn't rely on Midtrans
      const response = await fetch("/api/payments/cancel-failed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingRef,
          statusCode: statusCode || "FAILED",
          reason: "Payment page failed or user cancelled",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("✅ Booking cancelled successfully");
        setUpdateComplete(true);
      } else {
        console.error("❌ Failed to cancel booking:", data.error);
        setErrorMessage(data.error || "Failed to update booking status");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setErrorMessage("Network error while updating booking");
    } finally {
      setUpdating(false);
    }
  };

  if (updating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-background py-12">
        <div className="container-custom max-w-2xl">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Processing cancellation...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Releasing time slot and updating status...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-background py-12">
      <div className="container-custom max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Failed Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-10 h-10 text-error" />
            </motion.div>
            <h1 className="heading-2 mb-2 text-error">Payment Failed</h1>
            <p className="text-body">
              Your payment could not be processed. Please try again.
            </p>
            {bookingRef && (
              <p className="text-sm text-muted-foreground mt-2">
                Booking Reference: <strong>{bookingRef}</strong>
                {statusCode && (
                  <>
                    <br />
                    Error Code: <strong>{statusCode}</strong>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                <strong>Warning:</strong> {errorMessage}
                <br />
                <span className="text-xs mt-1 block">
                  Please contact support if you were charged. Ref: {bookingRef}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {updateComplete && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-800">
                ✓ Your booking has been cancelled and the time slot has been
                released. No charges were made to your account.
              </AlertDescription>
            </Alert>
          )}

          {/* Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">What happened?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  • Your payment was declined, cancelled, or failed to load
                </li>
                <li>• Your booking has been cancelled automatically</li>
                <li>• The time slot has been released for others to book</li>
                <li>• No charges were made to your account</li>
              </ul>
            </CardContent>
          </Card>

          {/* Common Reasons */}
          <Card className="mb-6 bg-muted/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">
                Common reasons for failure:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  • Payment page failed to load (QRIS image error, VA generation
                  error)
                </li>
                <li>• Midtrans payment gateway is experiencing issues</li>
                <li>• Network connection interrupted during payment</li>
                <li>• Payment method temporarily unavailable</li>
                <li>• Insufficient funds or card declined</li>
                <li>• Payment timeout (took too long)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="w-full rounded-full"
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              Try Booking Again
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="lg"
              className="w-full rounded-full"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>

          {/* Help Section */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                If you continue to experience issues or were charged
                incorrectly:
              </p>
              <div className="space-y-1 text-sm">
                <p>📱 WhatsApp: +62 812 3955 3510</p>
                <p>📧 Email: info@padelbap.com</p>
                {bookingRef && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Please quote reference: <strong>{bookingRef}</strong>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

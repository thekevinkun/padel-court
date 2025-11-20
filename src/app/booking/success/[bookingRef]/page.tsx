"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  MessageCircle,
  Info,
  Home,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { supabase } from "@/lib/supabase/client";
import { generateBookingReceipt } from "@/lib/pdf-generator";
import { sendWhatsAppReceipt } from "@/lib/whatsapp";

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const bookingRef = params.bookingRef as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [statusVerified, setStatusVerified] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingRef]);

  // Verify payment status after fetching booking
  useEffect(() => {
    if (booking && !statusVerified) {
      verifyPaymentStatus();
    }
  }, [booking, statusVerified]);

  // Function to verify payment status
  const verifyPaymentStatus = async () => {
    try {
      // If booking is already PAID, no need to check
      if (booking.status === "PAID") {
        setStatusVerified(true);
        return;
      }

      // If booking is PENDING, check with Midtrans
      if (booking.status === "PENDING") {
        console.log("🔍 Booking still PENDING, checking with Midtrans...");

        const response = await fetch("/api/payments/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingRef }),
        });

        if (response.ok) {
          const data = await response.json();

          // If payment actually failed, redirect to failed page
          if (data.status === "CANCELLED") {
            console.log("❌ Payment verification failed, redirecting...");
            router.push(`/booking/failed?order_id=BOOKING-${bookingRef}`);
            return;
          }

          // If payment succeeded, refresh booking data
          if (data.status === "PAID") {
            console.log("✅ Payment verified as PAID, refreshing...");
            await fetchBooking();
          }
        }
      }

      setStatusVerified(true);
    } catch (error) {
      console.error("Error verifying payment:", error);
      setStatusVerified(true);
    }
  };

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          courts (name, description)
        `
        )
        .eq("booking_ref", bookingRef)
        .single();

      if (error || !data) {
        console.error("Error fetching booking:", error);
        return;
      }
      // console.log("booking data: ", data);

      setBooking(data);

      // Generate PDF
      const receiptData = {
        bookingRef: data.booking_ref,
        customerName: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone,
        courtName: data.courts.name,
        date: new Date(data.date).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: data.time,
        numberOfPlayers: data.number_of_players,
        pricePerPerson: data.subtotal / data.number_of_players,
        subtotal: data.subtotal,
        paymentMethod: data.payment_method || "Online Payment",
        paymentFee: data.payment_fee,
        total: data.total_amount,
        notes: data.notes || "-",
        timestamp: new Date(data.created_at).toLocaleString("id-ID"),
      };

      const blob = await generateBookingReceipt(receiptData);
      setPdfBlob(blob);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfBlob || !booking) return;

    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Padel-Receipt-${booking.booking_ref}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(pdfUrl);
  };

  const handleShareWhatsApp = () => {
    if (!booking) return;

    const receiptData = {
      bookingRef: booking.booking_ref,
      customerName: booking.customer_name,
      email: booking.customer_email,
      phone: booking.customer_phone,
      courtName: booking.courts.name,
      date: new Date(booking.date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: booking.time,
      numberOfPlayers: booking.number_of_players,
      pricePerPerson: booking.subtotal / booking.number_of_players,
      subtotal: booking.subtotal,
      paymentMethod: booking.payment_method || "Online Payment",
      paymentFee: booking.payment_fee,
      total: booking.total_amount,
      notes: booking.notes || "-",
      timestamp: new Date(booking.created_at).toLocaleString("id-ID"),
    };

    const whatsappNumber =
      booking.customer_whatsapp?.replace(/\D/g, "") ||
      booking.customer_phone?.replace(/\D/g, "");

    if (whatsappNumber) {
      sendWhatsAppReceipt(whatsappNumber, receiptData, pdfBlob || undefined);
    }
  };

  if (loading || !statusVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find this booking. Please check your booking
              reference.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="rounded-full hover:text-accent-foreground"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest/5 to-background py-12">
      <div className="container-custom max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-forest" />
            </motion.div>

            <h1 className="heading-2 mb-2">Payment Successful!</h1>
            <p className="text-body">
              Your booking has been confirmed. See you on the court! 🎾
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Booking Reference
                  </p>
                  <p className="text-2xl font-bold text-forest">
                    {booking.booking_ref}
                  </p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ PAID
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Court:</span>
                  <span className="font-medium">{booking.courts.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(booking.date).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{booking.time}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-medium">
                    {booking.number_of_players}
                  </span>
                </div>

                <Separator className="my-4" />

                {/* Payment Summary */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm mb-2">
                    Payment Summary
                  </h4>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Court Booking:
                    </span>
                    <span>IDR {booking.subtotal.toLocaleString("id-ID")}</span>
                  </div>

                  {booking.require_deposit ? (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Deposit Paid (
                          {Math.round(
                            (booking.deposit_amount / booking.subtotal) * 100
                          )}
                          %):
                        </span>
                        <span className="font-medium text-green-700">
                          IDR {booking.deposit_amount.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {booking.remaining_balance > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Balance at Venue:
                          </span>
                          <span className="font-medium text-orange-600">
                            IDR{" "}
                            {booking.remaining_balance.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Full Payment:</span>
                        <span className="text-green-700">
                          IDR {booking.subtotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    Paid via{" "}
                    {booking.payment_method?.toUpperCase() || "Online Payment"}
                    {booking.payment_fee > 0 && (
                      <span className="block mt-1">
                        (Processing fee of IDR{" "}
                        {booking.payment_fee.toLocaleString("id-ID")} absorbed
                        by business)
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">
                    {booking.require_deposit
                      ? "Amount You Paid:"
                      : "Total Paid:"}
                  </span>
                  <span className="font-bold text-forest">
                    IDR {booking.total_amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Deposit reminder */}
              {booking.require_deposit && booking.remaining_balance > 0 && (
                <Alert className="bg-orange-50 border-orange-200 mt-4">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-800">
                    <strong>Remaining Balance:</strong> IDR{" "}
                    {booking.remaining_balance.toLocaleString("id-ID")}
                    <br />
                    Please pay this amount when you arrive at the venue.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              className="w-full rounded-full hover:text-accent-foreground"
            >
              <Download className="mr-2 h-5 w-5" />
              Download PDF Receipt
            </Button>

            <Button
              onClick={handleShareWhatsApp}
              variant="outline"
              size="lg"
              className="w-full rounded-full"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Share via WhatsApp
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="lg"
              className="w-full rounded-full"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>

          {/* Important Notes */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                ⚠️ Important Reminders
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Please arrive 10 minutes before your scheduled time</li>
                <li>• Bring this booking reference or receipt for check-in</li>
                <li>• Cancellation must be made 24 hours in advance</li>
                <li>• Contact us: +62 812 3456 7890</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

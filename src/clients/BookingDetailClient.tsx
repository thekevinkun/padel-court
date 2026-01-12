"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Mail,
  Phone,
  MessageCircle,
  AlertCircle,
  Loader2,
  Receipt,
  PlayCircle,
  StopCircle,
  Trophy,
  LucideIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { Booking } from "@/types/booking";
import { supabase } from "@/lib/supabase/client";
import { getDisplayStatus, getDisplayStatusStyle } from "@/lib/booking";

const BookingDetailClient = ({ bookingId }: { bookingId: string }) => {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [notes, setNotes] = useState("");

  // Check-in/out dialogs
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          courts (name, description),
          venue_payments (*)
        `
        )
        .eq("id", bookingId)
        .single();

      if (error) {
        console.error("Error fetching booking:", error);
        return;
      }
      setBooking(data);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!booking) return;
    setRecording(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/venue-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: booking.remaining_balance,
          paymentMethod,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle expired booking
        if (response.status === 410) {
          alert("⏰ Booking time has passed. Venue payment window expired.");
          await fetchBooking(); // Refresh to show updated state
          setPaymentDialogOpen(false);
          return;
        }

        throw new Error(errorData.error || "Failed to record payment");
      }

      await fetchBooking();
      setPaymentDialogOpen(false);
      setNotes("");
      setPaymentMethod("CASH");

      alert(
        `💵 Payment recorded successfully!\n\nIDR ${booking.remaining_balance.toLocaleString(
          "id-ID"
        )} received via ${paymentMethod}`
      );
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error recording payment:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setRecording(false);
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    if (!booking) return;
    setProcessing(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: sessionNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific error codes
        if (errorData.code === "VENUE_PAYMENT_REQUIRED") {
          alert(
            `❌ ${errorData.error}\n\nPlease record the venue payment first before checking in the customer.`
          );
          setCheckInDialogOpen(false);
          // Optionally open payment dialog
          setPaymentDialogOpen(true);
          return;
        }

        if (errorData.code === "VENUE_PAYMENT_EXPIRED") {
          alert(
            `⏰ ${errorData.error}\n\nThe booking time has passed and venue payment was not collected.`
          );
          setCheckInDialogOpen(false);
          return;
        }

        throw new Error(errorData.error || "Failed to check in");
      }

      await fetchBooking();
      setCheckInDialogOpen(false);
      setSessionNotes("");
      alert("🎾 Customer checked in successfully!");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error checking in:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    if (!booking) return;
    setProcessing(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: sessionNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check out");
      }

      await fetchBooking();
      setCheckOutDialogOpen(false);
      setSessionNotes("");
      alert("🏁 Customer checked out successfully!");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error checking out:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel booking");
      }

      await fetchBooking();
      setCancelDialogOpen(false);
      setCancelReason("");
      alert("❌ Booking cancelled successfully!");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error cancelling booking:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  // Session status badge
  const getSessionBadge = (sessionStatus: string) => {
    const styles = {
      UPCOMING: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    const icons = {
      UPCOMING: Clock,
      IN_PROGRESS: PlayCircle,
      COMPLETED: Trophy,
      CANCELLED: XCircle,
    };
    const Icon = icons[sessionStatus as keyof typeof icons] || Clock;
    const label = sessionStatus.replace("_", " ");

    return (
      <Badge
        className={`${styles[sessionStatus as keyof typeof styles]} text-sm`}
      >
        <Icon className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Booking Not Found</h3>
        <p className="text-muted-foreground mb-4">
          This booking doesn&apos;t exist or has been deleted.
        </p>
        <Button
          onClick={() => router.push("/admin/bookings")}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Button>
      </div>
    );
  }

  const needsVenuePayment =
    booking.status === "PAID" &&
    booking.require_deposit &&
    !booking.venue_payment_received &&
    !booking.venue_payment_expired &&
    booking.remaining_balance > 0;

  const venuePaymentExpired =
    booking.status === "PAID" &&
    booking.require_deposit &&
    !booking.venue_payment_received &&
    booking.venue_payment_expired;

  const displayStatus = getDisplayStatus(booking);

  const canCheckIn =
    booking.session_status === "UPCOMING" &&
    (displayStatus === "PAID" || displayStatus === "DEPOSIT PAID");

  const needsVenuePaymentForCheckIn =
    canCheckIn && displayStatus === "DEPOSIT PAID";

  const canCheckOut = booking.session_status === "IN_PROGRESS";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/admin/bookings")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Booking Details</h1>
            <p className="text-muted-foreground">
              Reference: {booking.booking_ref}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(() => {
            const displayStatus = getDisplayStatus(booking);
            const style = getDisplayStatusStyle(displayStatus);
            const icons: Record<string, LucideIcon> = {
              PAID: CheckCircle,
              "DEPOSIT PAID": Clock,
              "PAYMENT EXPIRED": AlertCircle,
              PENDING: Clock,
              CANCELLED: XCircle,
              EXPIRED: XCircle,
            };
            const Icon = icons[displayStatus] || Clock;

            return (
              <Badge className={`${style} text-sm`}>
                <Icon className="w-4 h-4 mr-1" />
                {displayStatus}
              </Badge>
            );
          })()}
          {getSessionBadge(booking.session_status)}
        </div>
      </div>

      {/* Session Action Buttons */}
      {(canCheckIn || canCheckOut || displayStatus === "PAYMENT EXPIRED") && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-5">
              <div className="flex-1">
                {displayStatus === "PAYMENT EXPIRED" && (
                  <>
                    <strong className="text-red-900">
                      ❌ Payment Window Expired
                    </strong>
                    <p className="text-sm text-red-700 mt-1">
                      Booking time passed without venue payment. Session
                      cancelled.
                    </p>
                  </>
                )}
                {canCheckIn && (
                  <>
                    <strong className="text-blue-900">
                      Ready to Check In?
                    </strong>
                    <p className="text-sm text-blue-700 mt-1">
                      Customer is ready to start their session
                    </p>
                    {needsVenuePaymentForCheckIn && (
                      <p className="text-sm text-orange-600 mt-2 font-semibold">
                        ⚠️ Warning: Customer must pay IDR{" "}
                        {booking.remaining_balance.toLocaleString("id-ID")} at
                        venue first
                      </p>
                    )}
                  </>
                )}
                {canCheckOut && (
                  <>
                    <strong className="text-green-900">
                      Session In Progress
                    </strong>
                    <p className="text-sm text-green-700 mt-1">
                      Check out customer when session completes
                    </p>
                  </>
                )}
              </div>

              {canCheckIn && (
                <Button
                  onClick={() => setCheckInDialogOpen(true)}
                  className={`bg-blue-600 hover:border-blue-600 ${
                    needsVenuePaymentForCheckIn
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                  disabled={needsVenuePaymentForCheckIn}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              )}

              {canCheckOut && (
                <Button
                  onClick={() => setCheckOutDialogOpen(true)}
                  className="bg-green-600 hover:border-green-700"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Venue Payment Alert */}
      {needsVenuePayment && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between gap-5">
              <div>
                <strong>Awaiting Venue Payment</strong>
                <p className="text-sm mt-1">
                  Customer needs to pay IDR{" "}
                  {booking.remaining_balance.toLocaleString("id-ID")} at venue
                </p>
              </div>
              <Button onClick={() => setPaymentDialogOpen(true)}>
                <Receipt className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Venue Payment Expired Alert */}
      {venuePaymentExpired && (
        <Alert className="bg-gray-50 border-gray-200">
          <AlertCircle className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <strong>⏰ Venue Payment Expired</strong>
            <p className="text-sm mt-1">
              Booking time has passed. Venue payment of IDR{" "}
              {booking.remaining_balance.toLocaleString("id-ID")} was not
              collected.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Venue Payment Completed */}
      {booking.venue_payment_received && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ Venue Payment Completed</strong>
            <p className="text-sm mt-1">
              Received IDR{" "}
              {booking.venue_payment_amount.toLocaleString("id-ID")} via{" "}
              {booking.venue_payment_method} on{" "}
              {booking.venue_payment_date
                ? new Date(booking.venue_payment_date).toLocaleString("id-ID")
                : "-"}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Session Timeline */}
      {booking.checked_in_at && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Session Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Checked In:</span>
              <span className="font-medium">
                {new Date(booking.checked_in_at).toLocaleString("id-ID")}
              </span>
            </div>
            {booking.checked_out_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Checked Out:</span>
                <span className="font-medium">
                  {new Date(booking.checked_out_at).toLocaleString("id-ID")}
                </span>
              </div>
            )}
            {booking.session_notes && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Session Notes:</span>
                  <p className="mt-1">{booking.session_notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Booking Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{booking.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{booking.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{booking.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{booking.customer_whatsapp}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Court</p>
                    <p className="font-medium">{booking?.courts?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(booking.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{booking.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Players</p>
                    <p className="font-medium">{booking.number_of_players}</p>
                  </div>
                </div>
              </div>
              {booking.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cancel Booking Button */}
          {booking.session_status === "UPCOMING" &&
            booking.status !== "CANCELLED" && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-red-900 text-sm">
                        Cancel This Booking
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Customer can&apos;t make it or didn&apos;t show up
                      </p>
                    </div>
                    <Button
                      onClick={() => setCancelDialogOpen(true)}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-700 hover:text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Right Column - Payment Summary */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Court Booking */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Court Booking</span>
                  <span className="font-medium">
                    IDR {booking.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Deposit or Full Payment */}
              {booking.customer_payment_choice === "DEPOSIT" ? (
                <>
                  {/* Online Deposit */}
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg space-y-2">
                    <h4 className="font-semibold text-blue-900 text-sm">
                      Online Deposit Payment
                    </h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-800">Deposit Paid</span>
                      <span className="font-medium">
                        IDR {booking.deposit_amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Midtrans Fee</span>
                      <span className="text-red-600">
                        - IDR {booking.payment_fee.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <Separator className="bg-blue-200" />
                    <div className="flex justify-between text-sm font-semibold text-green-700">
                      <span>Net Received</span>
                      <span>
                        IDR{" "}
                        {(
                          booking.deposit_amount - booking.payment_fee
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Venue Payment */}
                  {booking.venue_payment_received ? (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <h4 className="font-semibold text-green-900 text-sm mb-2">
                        Venue Payment (Cash)
                      </h4>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-green-800">Collected</span>
                        <span className="text-green-700">
                          IDR{" "}
                          {booking.venue_payment_amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ) : booking.venue_payment_expired ? (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Venue Payment (Expired)
                      </h4>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-800">Not Collected</span>
                        <span className="text-gray-700 line-through">
                          IDR{" "}
                          {booking.remaining_balance.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <h4 className="font-semibold text-orange-900 text-sm mb-2">
                        Venue Payment (Pending)
                      </h4>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-orange-800">To Collect</span>
                        <span className="text-orange-700">
                          IDR{" "}
                          {booking.remaining_balance.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Total Revenue */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-green-800 font-medium">
                          Total Business Revenue
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Booking value (excl. fees)
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-green-700">
                        IDR {booking.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Full Payment */}
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg space-y-2">
                    <h4 className="font-semibold text-blue-900 text-sm">
                      Full Payment Online
                    </h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-800">Customer Paid</span>
                      <span className="font-medium">
                        IDR {booking.total_amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Midtrans Fee</span>
                      <span className="text-red-600">
                        - IDR {booking.payment_fee.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <Separator className="bg-blue-200" />
                    <div className="flex justify-between text-sm font-semibold text-green-700">
                      <span>Net Received</span>
                      <span>
                        IDR{" "}
                        {(
                          booking.total_amount - booking.payment_fee
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-green-800 font-medium">
                        Total Business Revenue
                      </p>
                      <span className="text-2xl font-bold text-green-700">
                        IDR {booking.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Payment Method */}
              <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                <div className="flex justify-between mb-1">
                  <span>Online Payment Method:</span>
                  <span className="font-medium uppercase">
                    {booking.payment_method || "N/A"}
                  </span>
                </div>
                {booking.paid_at && (
                  <div className="flex justify-between">
                    <span>Paid At:</span>
                    <span className="font-medium">
                      {new Date(booking.paid_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Booking Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {new Date(booking.created_at).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium">
                  {new Date(booking.updated_at).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Choice:</span>
                <span className="font-medium">
                  {booking.customer_payment_choice || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-mono text-xs">{booking.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Venue Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Venue Payment</DialogTitle>
            <DialogDescription>
              Record the cash payment received at venue for booking{" "}
              <strong>{booking.booking_ref}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Amount Display */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800 mb-1">Amount to Receive</p>
              <p className="text-3xl font-bold text-green-700">
                IDR {booking.remaining_balance.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">💵 Cash</SelectItem>
                  <SelectItem value="DEBIT_CARD">💳 Debit Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">
                    🏦 Bank Transfer
                  </SelectItem>
                  <SelectItem value="QRIS">📱 QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this payment..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This will mark the booking as fully paid and update the
                financial records. This action cannot be undone.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPaymentDialogOpen(false)}
                disabled={recording}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleRecordPayment}
                disabled={recording}
              >
                {recording ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-In Dialog */}
      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check In Customer</DialogTitle>
            <DialogDescription>
              Mark {booking.customer_name} as checked in for their session at{" "}
              {booking.time}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <PlayCircle className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Start Session</p>
                  <p className="text-sm text-blue-700">
                    {booking?.courts?.name} • {booking.time}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="checkInNotes">Session Notes (Optional)</Label>
              <Textarea
                id="checkInNotes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Any notes about this session..."
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCheckInDialogOpen(false);
                  setSessionNotes("");
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleCheckIn}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking In...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-Out Dialog */}
      <Dialog open={checkOutDialogOpen} onOpenChange={setCheckOutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check Out Customer</DialogTitle>
            <DialogDescription>
              Mark {booking.customer_name}&apos;s session as completed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Complete Session
                  </p>
                  <p className="text-sm text-green-700">
                    {booking?.courts?.name} • {booking.time}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="checkOutNotes">Final Notes (Optional)</Label>
              <Textarea
                id="checkOutNotes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Any final notes about this session..."
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCheckOutDialogOpen(false);
                  setSessionNotes("");
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-700 hover:border-orange-700"
                onClick={handleCheckOut}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    Check Out
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Cancel booking {booking.booking_ref} for {booking.customer_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                <strong>Warning:</strong> This will cancel the session and mark
                it as CANCELLED. The time slot will be released. This action
                cannot be undone.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="cancelReason">Cancellation Reason *</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why is this booking being cancelled? (e.g., Customer no-show, Customer requested cancellation, etc.)"
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCancelDialogOpen(false);
                  setCancelReason("");
                }}
                disabled={cancelling}
              >
                Keep Booking
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleCancelBooking}
                disabled={cancelling || !cancelReason.trim()}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDetailClient;

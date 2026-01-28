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
} from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSettings } from "@/hooks/useSettings";
import { Booking } from "@/types/booking";
import { supabase } from "@/lib/supabase/client";
import {
  getSessionStatusColor,
  getSessionStatusIcon,
  getDisplayStatus,
  getDisplayStatusStyle,
  getDisplayStatusIcon,
} from "@/lib/booking";

const BookingDetailClient = ({ bookingId }: { bookingId: string }) => {
  const router = useRouter();
  const { settings } = useSettings();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [notes, setNotes] = useState("");

  // Start for Check-in/out dialog
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  // State for cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // State for refund dialog
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("MIDTRANS");
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [refunding, setRefunding] = useState(false);

  // Get bookings on initial and on set bookingId
  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  // Function to fetch bookings
  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          courts (name, description),
          venue_payments (*),
          booking_time_slots (
            id,
            time_slot_id,
            time_slots (time_start, time_end, period, price_per_person)
          )
        `,
        )
        .eq("id", bookingId)
        .single();

      if (error) {
        throw new Error(error.message || "Failed to fetch bookings");
      }

      setBooking(data);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching bookings:", err);
      toast.error("Failed to fetch bookings", {
        description: err.message,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to record venue payment
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
          toast.error(
            "Booking time has passed. Venue payment window expired.",
            { duration: 5000 },
          );
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

      toast.success("Payment recorded successfully!", {
        description: `IDR ${booking.remaining_balance.toLocaleString("id-ID")} received via ${paymentMethod}`,
        duration: Infinity,
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error recording payment:", err);
      toast.error("Failed to record customer payment", {
        description: err.message,
        duration: 5000,
      });
    } finally {
      setRecording(false);
    }
  };

  // Function to handle check-in
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
          toast.error(`⏰ ${errorData.error}`, {
            description:
              "Please record the venue payment first before checking in the customer.",
            duration: 5000,
          });
          setCheckInDialogOpen(false);
          // Optionally open payment dialog
          setPaymentDialogOpen(true);
          return;
        }

        if (errorData.code === "VENUE_PAYMENT_EXPIRED") {
          toast.error(`⏰ ${errorData.error}`, {
            description:
              "The booking time has passed and venue payment was not collected.",
            duration: 5000,
          });
          setCheckInDialogOpen(false);
          return;
        }

        throw new Error(errorData.error || "Failed to check in");
      }

      await fetchBooking();
      setCheckInDialogOpen(false);
      setSessionNotes("");
      toast.success("Customer checked in successfully!");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error checking in:", err);
      toast.error("Failed to check in", {
        description: err.message,
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };

  // Function to handle check-out
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
      toast.success("Customer checked out successfully!");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error checking out:", err);
      toast.error("Failed to check out", {
        description: err.message,
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };

  // Function to handle cancel booking
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
      toast.success("Booking cancelled successfully!");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error cancelling booking:", err);
      toast.error("Failed to cancel booking", {
        description: err.message,
        duration: 5000,
      });
    } finally {
      setCancelling(false);
    }
  };

  /* Refund Logic */
  // Refund policy constants
  const REFUND_FULL_HOURS = settings?.refund_full_hours ?? 24;
  const REFUND_PARTIAL_HOURS = settings?.refund_partial_hours ?? 12;
  const REFUND_PARTIAL_PERCENTAGE = settings?.refund_partial_percentage ?? 50;

  // Calculate hours until session starts
  const getHoursUntilSession = (booking: Booking): number => {
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.time
      .split(" - ")[0]
      .split(":")
      .map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    return Math.round(
      (bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60),
    );
  };

  // Get refund type based on policy
  const getRefundType = (booking: Booking): "FULL" | "PARTIAL" | "NONE" => {
    const hours = getHoursUntilSession(booking);

    if (hours >= REFUND_FULL_HOURS) return "FULL";
    if (hours >= REFUND_PARTIAL_HOURS) return "PARTIAL";
    return "NONE";
  };

  // Calculate eligible refund amount
  const calculateEligibleRefund = (booking: Booking): number => {
    const refundType = getRefundType(booking);

    if (refundType === "FULL") return booking.total_amount;
    if (refundType === "PARTIAL")
      return Math.round(
        booking.total_amount * (REFUND_PARTIAL_PERCENTAGE / 100),
      );
    return 0;
  };

  // Check if refund is allowed
  const canProcessRefund = (booking: Booking): boolean => {
    return (
      booking.status === "PAID" &&
      booking.session_status === "UPCOMING" &&
      !booking.refund_status
    );
  };

  // Function to handle refund processing
  const handleProcessRefund = async () => {
    if (!booking) return;

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid refund amount", { duration: 5000 });
      return;
    }

    if (amount > booking.total_amount) {
      toast.error(
        `Refund amount cannot exceed IDR ${booking.total_amount.toLocaleString("id-ID")}`,
        { duration: 5000 },
      );
      return;
    }

    if (!refundReason.trim()) {
      toast.error("Please provide a refund reason", { duration: 5000 });
      return;
    }

    setRefunding(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundAmount: amount,
          refundMethod,
          reason: refundReason,
          notes: refundNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process refund");
      }

      await fetchBooking(); // Refresh booking data
      setRefundDialogOpen(false);
      setRefundAmount("");
      setRefundMethod("MIDTRANS");
      setRefundReason("");
      setRefundNotes("");

      toast.success("Refund processed successfully!", {
        description: `Amount: IDR ${amount.toLocaleString("id-ID")} via ${refundMethod}`,
        duration: Infinity,
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error processing refund:", err);
      toast.error("Failed to process refund", {
        description: err.message,
        duration: 5000,
      });
    } finally {
      setRefunding(false);
    }
  };

  // Badge for booking status
  const getStatusBadge = (booking: Booking) => {
    const displayStatus = getDisplayStatus(booking);
    const style = getDisplayStatusStyle(displayStatus);
    const Icon = getDisplayStatusIcon(displayStatus);

    return (
      <Badge className={style}>
        <Icon className="w-3 h-3 mr-1" />
        {displayStatus}
      </Badge>
    );
  };

  // Badge for session status
  const getSessionBadge = (sessionStatus: string) => {
    const styles = getSessionStatusColor(sessionStatus);
    const Icon = getSessionStatusIcon(sessionStatus);
    const label = sessionStatus.replace("_", " ");

    return (
      <Badge className={`${styles} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
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
          This booking doesn't exist or has been deleted.
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
    booking.session_status !== "CANCELLED" &&
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
          {getStatusBadge(booking)}
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
                        ⚠️ Customer must pay IDR{" "}
                        {booking.remaining_balance.toLocaleString("en-ID")} at
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
                  {booking.remaining_balance.toLocaleString("en-ID")} at venue
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
              {booking.remaining_balance.toLocaleString("en-ID")} was not
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
              {booking.venue_payment_amount.toLocaleString("en-ID")} via{" "}
              {booking.venue_payment_method} on{" "}
              {booking.venue_payment_date
                ? new Date(booking.venue_payment_date).toLocaleString("en-ID")
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
                {new Date(booking.checked_in_at).toLocaleString("en-ID")}
              </span>
            </div>
            {booking.checked_out_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Checked Out:</span>
                <span className="font-medium">
                  {new Date(booking.checked_out_at).toLocaleString("en-ID")}
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
                      {new Date(booking.date).toLocaleDateString("en-ID", {
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
                    <p className="font-medium">
                      {booking.time}
                      {booking.duration_hours > 1 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {booking.duration_hours} hours
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                {/* Optional: Show slot breakdown for multi-hour bookings */}
                {booking.booking_time_slots &&
                  booking.booking_time_slots.length > 1 && (
                    <div className="col-span-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View {booking.booking_time_slots.length} time slot
                          breakdown
                        </summary>
                        <ul className="mt-2 space-y-1 ml-4 text-muted-foreground">
                          {booking.booking_time_slots.map((bts) => {
                            if (!bts.time_slots) return null;

                            return (
                              <li key={bts.id}>
                                • {bts.time_slots.time_start.slice(0, 5)} -{" "}
                                {bts.time_slots.time_end.slice(0, 5)} (
                                {bts.time_slots.period}) - IDR{" "}
                                {bts.time_slots.price_per_person.toLocaleString(
                                  "id-ID",
                                )}
                                /pax
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    </div>
                  )}
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

          {/* Refund Section */}
          {canProcessRefund(booking) && (
            <Card
              className={
                getRefundType(booking) === "FULL"
                  ? "border-green-200 bg-green-50"
                  : getRefundType(booking) === "PARTIAL"
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
              }
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Refund Policy Header */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p
                        className={`font-semibold text-sm ${
                          getRefundType(booking) === "FULL"
                            ? "text-green-900"
                            : getRefundType(booking) === "PARTIAL"
                              ? "text-blue-900"
                              : "text-gray-900"
                        }`}
                      >
                        {getRefundType(booking) === "FULL" &&
                          "✅ Full Refund Available"}
                        {getRefundType(booking) === "PARTIAL" &&
                          "⚖️ Partial Refund Available (50%)"}
                        {getRefundType(booking) === "NONE" &&
                          "⚠️ No Refund Available"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          getRefundType(booking) === "FULL"
                            ? "text-green-700"
                            : getRefundType(booking) === "PARTIAL"
                              ? "text-blue-700"
                              : "text-gray-600"
                        }`}
                      >
                        Session starts in {getHoursUntilSession(booking)} hours
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setRefundDialogOpen(true);
                        const eligibleAmount = calculateEligibleRefund(booking);
                        setRefundAmount(
                          eligibleAmount > 0 ? eligibleAmount.toString() : "",
                        );
                      }}
                      variant="outline"
                      size="sm"
                      className={
                        getRefundType(booking) === "NONE"
                          ? "border-gray-300 text-gray-500 opacity-50 cursor-not-allowed"
                          : getRefundType(booking) === "FULL"
                            ? "border-green-300 text-green-700 hover:bg-green-700 hover:text-white"
                            : "border-blue-300 text-blue-700 hover:bg-blue-700 hover:text-white"
                      }
                      disabled={getRefundType(booking) === "NONE"}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Process Refund
                    </Button>
                  </div>

                  {/* Policy Explanation */}
                  <div
                    className={`text-xs p-3 rounded border ${
                      getRefundType(booking) === "FULL"
                        ? "bg-green-100 border-green-300 text-green-800"
                        : getRefundType(booking) === "PARTIAL"
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}
                  >
                    {getRefundType(booking) === "FULL" && (
                      <>
                        <strong>100% Refund Policy:</strong> Cancelled ≥24 hours
                        before session.
                        <br />
                        <span className="font-semibold">
                          Refund Amount: IDR{" "}
                          {calculateEligibleRefund(booking).toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </>
                    )}
                    {getRefundType(booking) === "PARTIAL" && (
                      <>
                        <strong>50% Refund Policy:</strong> Cancelled 12-24
                        hours before session.
                        <br />
                        <span className="font-semibold">
                          Refund Amount: IDR{" "}
                          {calculateEligibleRefund(booking).toLocaleString(
                            "id-ID",
                          )}
                        </span>
                        <br />
                        <span className="text-xs opacity-80">
                          (50% of IDR{" "}
                          {booking.total_amount.toLocaleString("id-ID")})
                        </span>
                      </>
                    )}
                    {getRefundType(booking) === "NONE" && (
                      <>
                        <strong>No Refund Policy:</strong> Cancelled &lt;12
                        hours before session.
                        <br />
                        Our policy requires at least 12 hours advance notice for
                        refunds. The time slot can still be released if you
                        cancel the booking.
                      </>
                    )}
                  </div>

                  {/* Refund Policy Reference */}
                  <div className="text-xs text-muted-foreground bg-white/50 p-2 rounded border border-gray-200">
                    <strong>Refund Policy:</strong>
                    <ul className="mt-1 space-y-0.5 ml-4 list-disc">
                      <li>
                        ≥24 hours before session → <strong>100% refund</strong>
                      </li>
                      <li>
                        12-24 hours before session → <strong>50% refund</strong>
                      </li>
                      <li>
                        &lt;12 hours before session → <strong>No refund</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refund Completed Badge */}
          {booking.refund_status === "COMPLETED" && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-900 text-sm">
                      Refund Completed
                    </p>
                  </div>
                  <div className="text-xs text-green-800 space-y-1">
                    <p>
                      <strong>Amount:</strong> IDR{" "}
                      {booking.refund_amount?.toLocaleString("en-ID")}
                    </p>
                    <p>
                      <strong>Method:</strong> {booking.refund_method}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {booking.refund_date
                        ? new Date(booking.refund_date).toLocaleString("en-ID")
                        : "-"}
                    </p>
                    {booking.refund_reason && (
                      <p>
                        <strong>Reason:</strong> {booking.refund_reason}
                      </p>
                    )}
                    {booking.refund_notes && (
                      <p>
                        <strong>Notes:</strong> {booking.refund_notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                        Customer can't make it or didn't show up
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
              {/* Refund Notice (if refunded) */}
              {booking.refund_status === "COMPLETED" && (
                <>
                  <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">
                        REFUNDED
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-800">Refund Amount:</span>
                        <span className="font-bold text-purple-900">
                          IDR {booking.refund_amount?.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-800">Refund Method:</span>
                        <span className="font-medium">
                          {booking.refund_method}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-800">Refund Date:</span>
                        <span className="font-medium">
                          {booking.refund_date
                            ? new Date(booking.refund_date).toLocaleString(
                                "en-ID",
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Court Booking (Original Amount) */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Court Booking
                    {booking.refund_status === "COMPLETED" && " (Refunded)"}
                  </span>
                  <span className="font-medium">
                    IDR {booking.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Payment Breakdown */}
              {booking.customer_payment_choice === "DEPOSIT" ? (
                <>
                  {/* Deposit Payment */}
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg space-y-2">
                    <h4 className="font-semibold text-blue-900 text-sm">
                      Online Deposit
                      {booking.refund_status === "COMPLETED" && " (Refunded)"}
                    </h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-800">Deposit Paid</span>
                      <span className="font-medium">
                        IDR {booking.deposit_amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Venue Payment Status */}
                  {booking.venue_payment_received ? (
                    // Venue payment collected
                    <div
                      className={`bg-green-50 border border-green-200 p-3 rounded-lg ${
                        booking.refund_status === "COMPLETED"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      <h4 className="font-semibold text-green-900 text-sm mb-2">
                        ✅ Venue Payment
                        {booking.refund_status === "COMPLETED" && " (Refunded)"}
                      </h4>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-green-800">Collected</span>
                        <span
                          className={`text-green-700 ${
                            booking.refund_status === "COMPLETED"
                              ? "line-through"
                              : ""
                          }`}
                        >
                          IDR{" "}
                          {booking.venue_payment_amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ) : booking.status === "CANCELLED" ||
                    booking.session_status === "CANCELLED" ||
                    booking.refund_status === "COMPLETED" ? (
                    // Booking cancelled/refunded
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <h4 className="font-semibold text-red-900 text-sm mb-2">
                        Venue Payment (Cancelled)
                      </h4>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-red-800">Not Collected</span>
                        <span className="text-red-700 line-through">
                          IDR{" "}
                          {booking.remaining_balance.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ) : booking.venue_payment_expired ? (
                    // Venue payment expired
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        ⏰ Venue Payment (Expired)
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
                    // Venue payment pending
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <h4 className="font-semibold text-orange-900 text-sm mb-2">
                        ⏳ Venue Payment (Pending)
                      </h4>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-orange-800">To Pay at Venue</span>
                        <span className="text-orange-700">
                          IDR{" "}
                          {booking.remaining_balance.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Total Booking Value */}
                  <div
                    className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg 
                    border-2 text-green-800 border-green-300"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Total Booking Value</p>
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
                      {booking.refund_status === "COMPLETED" && " (Refunded)"}
                    </h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-800">Paid Online</span>
                      <span className="font-medium">
                        IDR {booking.total_amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total Booking Value */}
                  <div
                    className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 
                    text-green-800 border-green-300"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Total Booking Value</p>
                      <span className="text-2xl font-bold">
                        IDR {booking.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Net Revenue Impact (if refunded) */}
              {booking.refund_status === "COMPLETED" && (
                <>
                  <Separator />
                  <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-red-800 font-medium">
                        Revenue Impact
                      </p>
                      <span className="text-2xl font-bold text-red-700">
                        - IDR {booking.refund_amount?.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Revenue reduced by refund
                    </p>
                  </div>
                </>
              )}

              {/* Total Revenue after cancelled (for deposit, not refund) */}
              {booking.customer_payment_choice === "DEPOSIT" &&
                booking.session_status === "CANCELLED" &&
                booking.refund_status !== "COMPLETED" && (
                  <>
                    <Separator />
                    <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-green-800 font-medium">
                          Total Revenue (After Cancelled)
                        </p>
                        <span className="text-2xl font-bold text-green-700">
                          IDR {booking.deposit_amount?.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Revenue only from deposit kept
                      </p>
                    </div>
                  </>
                )}

              {/* Payment Method Info */}
              <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                <div className="flex justify-between mb-1">
                  <span>Payment Method:</span>
                  <span className="font-medium uppercase">
                    {booking.payment_method || "N/A"}
                  </span>
                </div>
                {booking.paid_at && (
                  <div className="flex justify-between">
                    <span>Paid At:</span>
                    <span className="font-medium">
                      {new Date(booking.paid_at).toLocaleString("en-ID")}
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
                  {new Date(booking.created_at).toLocaleString("en-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium">
                  {new Date(booking.updated_at).toLocaleString("en-ID")}
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
                IDR {booking.remaining_balance.toLocaleString("en-ID")}
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
                className="flex-1 bg-blue-600 hover:border-blue-700"
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
              Mark {booking.customer_name}'s session as completed
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
                className="flex-1 bg-red-600 hover:border-red-700"
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

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund payment for booking <strong>{booking.booking_ref}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Policy-Based Refund Notice */}
            <Alert
              className={
                getRefundType(booking) === "FULL"
                  ? "bg-green-50 border-green-200"
                  : getRefundType(booking) === "PARTIAL"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
              }
            >
              <AlertCircle
                className={`h-4 w-4 ${
                  getRefundType(booking) === "FULL"
                    ? "text-green-600"
                    : getRefundType(booking) === "PARTIAL"
                      ? "text-blue-600"
                      : "text-gray-600"
                }`}
              />
              <AlertDescription
                className={
                  getRefundType(booking) === "FULL"
                    ? "text-green-800"
                    : getRefundType(booking) === "PARTIAL"
                      ? "text-blue-800"
                      : "text-gray-800"
                }
              >
                <strong>
                  {getRefundType(booking) === "FULL" && "✅ Full Refund (100%)"}
                  {getRefundType(booking) === "PARTIAL" &&
                    "⚖️ Partial Refund (50%)"}
                  {getRefundType(booking) === "NONE" &&
                    "⚠️ No Refund Available"}
                </strong>
                <p className="text-xs mt-1">
                  Session starts in {getHoursUntilSession(booking)} hours.
                  {getRefundType(booking) === "FULL" &&
                    " Customer is eligible for full refund (≥24hrs policy)."}
                  {getRefundType(booking) === "PARTIAL" &&
                    " Customer is eligible for 50% refund (12-24hrs policy)."}
                  {getRefundType(booking) === "NONE" &&
                    " Customer is not eligible for refund (<12hrs policy)."}
                </p>
              </AlertDescription>
            </Alert>

            {/* Refund Amount */}
            <div>
              <Label htmlFor="refundAmount">Refund Amount *</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  IDR
                </span>
                <Input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0"
                  className="pl-12"
                  min="0"
                  max={booking.total_amount}
                  step="1000"
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <p>
                  <strong>Policy-based amount:</strong> IDR{" "}
                  {calculateEligibleRefund(booking).toLocaleString("id-ID")}
                  {getRefundType(booking) === "PARTIAL" && " (50% of total)"}
                </p>
                <p>
                  Maximum allowed: IDR{" "}
                  {booking.total_amount.toLocaleString("id-ID")}
                </p>
                {parseFloat(refundAmount) > calculateEligibleRefund(booking) &&
                  calculateEligibleRefund(booking) > 0 && (
                    <p className="text-orange-600 font-semibold">
                      ⚠️ Amount exceeds policy recommendation
                    </p>
                  )}
              </div>
            </div>

            {/* Refund Method */}
            <div>
              <Label htmlFor="refundMethod">Refund Method *</Label>
              <Select value={refundMethod} onValueChange={setRefundMethod}>
                <SelectTrigger id="refundMethod" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIDTRANS">
                    💳 Midtrans (Auto Refund)
                  </SelectItem>
                  <SelectItem value="MANUAL_TRANSFER">
                    🏦 Manual Bank Transfer
                  </SelectItem>
                  <SelectItem value="CASH">💵 Cash Refund</SelectItem>
                  <SelectItem value="STORE_CREDIT">
                    🎫 Store Credit/Voucher
                  </SelectItem>
                </SelectContent>
              </Select>
              {refundMethod === "MIDTRANS" && (
                <p className="text-xs text-blue-600 mt-1">
                  ⚠️ You'll need to process this in Midtrans dashboard
                  separately
                </p>
              )}
            </div>

            {/* Refund Reason */}
            <div>
              <Label htmlFor="refundReason">Refund Reason *</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Why is this refund being processed?"
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Admin Notes */}
            <div>
              <Label htmlFor="refundNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="refundNotes"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                placeholder="Internal notes about this refund..."
                className="mt-2"
                rows={2}
              />
            </div>

            {/* Warning */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-xs text-yellow-800">
                <strong>Important:</strong> This will mark the booking as
                refunded and release the time slot. This action records the
                refund in the system but does NOT automatically process payment
                refunds. You must manually process the refund through your
                payment provider.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRefundDialogOpen(false);
                  setRefundAmount("");
                  setRefundMethod("MIDTRANS");
                  setRefundReason("");
                  setRefundNotes("");
                }}
                disabled={refunding}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:border-orange-700"
                onClick={handleProcessRefund}
                disabled={refunding || !refundAmount || !refundReason.trim()}
              >
                {refunding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Process Refund
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

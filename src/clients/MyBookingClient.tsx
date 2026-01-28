"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Mail,
  Hash,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  XCircle,
  Info,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useSettings } from "@/hooks/useSettings";
import { Booking } from "@/types/booking";
import {
  getSessionStatusColor,
  getSessionStatusIcon,
  getDisplayStatus,
  getDisplayStatusStyle,
  getDisplayStatusIcon,
  getHoursUntilBooking,
  isBookingExpired,
} from "@/lib/booking";

const MyBookingClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings } = useSettings();

  // Get params from URL
  const urlEmail = searchParams.get("email");
  const urlBookingRef = searchParams.get("booking_ref");

  // Email and Booking Ref state
  const [email, setEmail] = useState(urlEmail || "");
  const [bookingRef, setBookingRef] = useState(urlBookingRef || "");
  const [loading, setLoading] = useState(false);

  // Lookup state
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [isAlreadyLookup, setIsAlreadyLookup] = useState(false);
  const [error, setError] = useState("");

  // Booking data state
  const [booking, setBooking] = useState<Booking | null>(null);

  // Cancellation dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Auto-lookup if URL has params
  useEffect(() => {
    const checkUrlForLookup = async () => {
      if (urlEmail && urlBookingRef) {
        setLoadingLookup(true);
        await handleLookup(null, urlEmail, urlBookingRef);
        setLoadingLookup(false);
      }
    };

    // Prevent duplicate lookup between URL and form
    if (!isAlreadyLookup) checkUrlForLookup();
  }, [urlEmail, urlBookingRef]);

  // Function to handle lookup
  const handleLookup = async (
    e: React.FormEvent | null,
    paramEmail?: string,
    paramBookingRef?: string,
  ) => {
    if (e) e.preventDefault();

    // Start prevent duplicate lookup
    setIsAlreadyLookup(false);

    // Start loading
    setLoading(true);
    setError("");
    setBooking(null);

    // Determine which email and booking ref to use
    const lookupEmail = paramEmail || email;
    const lookupRef = paramBookingRef || bookingRef;

    try {
      // API call to lookup booking
      const response = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: lookupEmail.trim(),
          bookingRef: lookupRef.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.found) {
        setError(
          data.error ||
            "Booking not found. Please check your details and try again.",
        );
        return;
      }

      setBooking(data.booking);

      // Update URL with query params (if not from URL already)
      if (!urlEmail || !urlBookingRef) {
        const newUrl = `/my-booking?email=${encodeURIComponent(
          lookupEmail,
        )}&booking_ref=${lookupRef.toUpperCase()}`;
        router.push(newUrl);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Failed to lookup booking.", {
        description: err.message,
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setIsAlreadyLookup(true);
    }
  };

  // Reset form and booking data
  const handleReset = () => {
    setEmail("");
    setBookingRef("");
    setError("");
    setBooking(null);
    // Clear URL params
    router.push("/my-booking");
  };

  // Handle customer cancellation
  const handleCancelBooking = async () => {
    if (!booking) return;

    // Validate reason
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    // Confirm cancellation
    if (
      !confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      )
    ) {
      return;
    }

    setCancelling(true);

    try {
      // API call to cancel booking
      const response = await fetch(
        `/api/bookings/${booking.id}/cancel-customer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: cancelReason }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      // Show success message
      toast.success(data.message);

      // Refresh booking data
      await handleLookup(null, booking.customer_email, booking.booking_ref);

      // Close dialog
      setCancelDialogOpen(false);
      setCancelReason("");
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

  // Check if booking can be cancelled
  const canCancelBooking = (booking: Booking): boolean => {
    // Cannot cancel if already cancelled/refunded
    if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
      return false;
    }

    // Cannot cancel if not paid
    if (booking.status !== "PAID") {
      return false;
    }

    // Cannot cancel if already started or completed
    if (
      booking.session_status === "IN_PROGRESS" ||
      booking.session_status === "COMPLETED"
    ) {
      return false;
    }

    // Cannot cancel if booking time has passed
    if (isBookingExpired(booking)) {
      return false;
    }

    return true;
  };

  /* Refund Logic */
  // Refund policy constants
  const REFUND_FULL_HOURS = settings?.refund_full_hours ?? 24;
  const REFUND_PARTIAL_HOURS = settings?.refund_partial_hours ?? 12;
  const REFUND_PARTIAL_PERCENTAGE = settings?.refund_partial_percentage ?? 50;

  // Calculate hours until booking

  // Get refund type based on hours until session
  const getRefundType = (booking: Booking): "FULL" | "PARTIAL" | "NONE" => {
    const hours = getHoursUntilBooking(booking);

    if (hours >= REFUND_FULL_HOURS) return "FULL";
    if (hours >= REFUND_PARTIAL_HOURS) return "PARTIAL";
    return "NONE";
  };

  // Calculate refund amount
  const calculateRefundAmount = (booking: Booking): number => {
    const refundType = getRefundType(booking);

    if (refundType === "FULL") return booking.total_amount;
    if (refundType === "PARTIAL")
      return Math.round(
        booking.total_amount * (REFUND_PARTIAL_PERCENTAGE / 100),
      );
    return 0;
  };

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

  // Session status badge
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

  if (loadingLookup) {
    return (
      <div className="bg-gradient-to-b from-forest/5 to-background flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest/5 to-background py-12">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-forest" />
            </div>

            <h1 className="heading-2 mb-2">Find My Booking</h1>
            <p className="text-body">
              Enter your email and booking reference to view your booking
              details
            </p>
          </div>

          {/* Search Form */}
          {!booking && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <form onSubmit={(e) => handleLookup(e)} className="space-y-4">
                  {error && (
                    <Alert
                      variant="destructive"
                      className="bg-red-100 border-red-800"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-accent-foreground">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the email used when making the booking
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bookingRef">Booking Reference *</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bookingRef"
                        type="text"
                        placeholder="BAP12345678"
                        value={bookingRef}
                        onChange={(e) =>
                          setBookingRef(e.target.value.toUpperCase())
                        }
                        required
                        disabled={loading}
                        className="pl-10 uppercase"
                        maxLength={20}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your booking reference from the confirmation email (e.g.,
                      BAP12345678)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find My Booking
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Booking Details */}
          {booking && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                  <p className="text-muted-foreground">
                    Reference: {booking.booking_ref}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {getStatusBadge(booking)}
                  {getSessionBadge(booking.session_status)}
                </div>
              </div>

              {/* Alerts */}
              {booking.status === "REFUNDED" ? (
                <Alert
                  variant="destructive"
                  className=" bg-purple-50 border-purple-300"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong className="text-purpler-900">
                      💲BOOKING REFUNDED
                    </strong>
                    <p className="text-sm text-purple-800 mt-1">
                      This booking has been refunded due to customer
                      cancellation.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : booking.session_status === "COMPLETED" ? (
                <Alert
                  variant="destructive"
                  className=" bg-green-50 border-green-300"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong className="text-green-900">
                      ✅ BOOKING COMPLETED
                    </strong>
                    <p className="text-sm text-green-800 mt-1">
                      This booking session has been completed. Thank you for
                      playing at our Padel court.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : booking.venue_payment_expired ? (
                <Alert className="bg-red-50 border-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong className="text-red-900">
                      ⏰ Venue Payment Expired
                    </strong>
                    <p className="text-sm text-red-800 mt-1">
                      The booking time has passed. Remaining balance was not
                      collected.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : booking.status === "CANCELLED" ? (
                <Alert className="bg-red-50 border-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong className="text-red-900">
                      ⏰ Booking Cancelled
                    </strong>
                    <p className="text-sm text-red-800 mt-1">
                      This booking has been cancelled without refund.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                isBookingExpired(booking) && (
                  <Alert
                    variant="destructive"
                    className="bg-red-50 border-red-300"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong className="text-red-900">
                        ⏰ BOOKING {booking.session_status}
                      </strong>
                      <p className="text-sm text-red-800 mt-1">
                        This booking time has passed.{" "}
                        {booking.status === "EXPIRED" &&
                          "The session did not occur or was not checked in."}
                      </p>
                    </AlertDescription>
                  </Alert>
                )
              )}

              {/* Status Alerts */}
              {booking.require_deposit &&
                !booking.venue_payment_received &&
                !booking.venue_payment_expired &&
                booking.remaining_balance > 0 &&
                booking.session_status !== "CANCELLED" &&
                !isBookingExpired(booking) && (
                  <Alert className="bg-orange-50 border-orange-200">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Payment Required at Venue</strong>
                      <p className="text-sm mt-1">
                        Please pay IDR{" "}
                        {booking.remaining_balance.toLocaleString("id-ID")} when
                        you arrive.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

              {/* Cancellation Policy Info */}
              {canCancelBooking(booking) && (
                <Alert
                  className={
                    getRefundType(booking) === "FULL"
                      ? "bg-green-50 border-green-200"
                      : getRefundType(booking) === "PARTIAL"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-orange-50 border-orange-200"
                  }
                >
                  <Info
                    className={`h-4 w-4 ${
                      getRefundType(booking) === "FULL"
                        ? "text-green-600"
                        : getRefundType(booking) === "PARTIAL"
                          ? "text-blue-600"
                          : "text-orange-600"
                    }`}
                  />
                  <AlertDescription
                    className={
                      getRefundType(booking) === "FULL"
                        ? "text-green-800"
                        : getRefundType(booking) === "PARTIAL"
                          ? "text-blue-800"
                          : "text-orange-800"
                    }
                  >
                    <strong>Cancellation Policy</strong>
                    <p className="text-sm mt-1">
                      {getRefundType(booking) === "FULL" ? (
                        <>
                          ✅ <strong>Full refund available</strong> - Session is{" "}
                          {getHoursUntilBooking(booking)} hours away (≥24hrs
                          policy)
                        </>
                      ) : getRefundType(booking) === "PARTIAL" ? (
                        <>
                          ⚖️ <strong>50% refund available</strong> - Session is{" "}
                          {getHoursUntilBooking(booking)} hours away (12-24hrs
                          policy)
                          <br />
                          <span className="text-xs">
                            Refund: IDR{" "}
                            {calculateRefundAmount(booking).toLocaleString(
                              "id-ID",
                            )}
                          </span>
                        </>
                      ) : (
                        <>
                          ⚠️ <strong>No refund available</strong> - Session is{" "}
                          {getHoursUntilBooking(booking)} hours away (&lt;12hrs
                          policy)
                        </>
                      )}
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* REST OF THE BOOKING DETAILS COMPONENT - KEEP AS IS */}
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
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{booking.customer_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">
                            {booking.customer_email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">
                            {booking.customer_phone}
                          </p>
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
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Court</p>
                          <p className="font-medium">{booking.courts?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(booking.date).toLocaleDateString(
                              "en-ID",
                              {
                                timeZone: "Asia/Makassar",
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
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
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Players
                          </p>
                          <p className="font-medium">
                            {booking.number_of_players}
                          </p>
                        </div>
                      </div>
                      {booking.notes && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Notes
                            </p>
                            <p className="text-sm">{booking.notes}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Session Timeline */}
                  {booking.checked_in_at && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Session Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Checked In:
                          </span>
                          <span className="font-medium">
                            {new Date(booking.checked_in_at).toLocaleString(
                              "en-ID",
                            )}
                          </span>
                        </div>
                        {booking.checked_out_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Checked Out:
                            </span>
                            <span className="font-medium">
                              {new Date(booking.checked_out_at).toLocaleString(
                                "en-ID",
                              )}
                            </span>
                          </div>
                        )}
                        {booking.session_notes && (
                          <>
                            <Separator />
                            <div>
                              <span className="text-muted-foreground">
                                Session Notes:
                              </span>
                              <p className="mt-1">{booking.session_notes}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    {canCancelBooking(booking) && (
                      <Button
                        onClick={() => setCancelDialogOpen(true)}
                        variant="destructive"
                        size="lg"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Request Cancellation
                      </Button>
                    )}
                    <Button onClick={handleReset} variant="outline" size="lg">
                      <Search className="w-4 h-4 mr-2" />
                      Look Up Another Booking
                    </Button>
                  </div>
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
                                <span className="text-purple-800">
                                  Refund Amount:
                                </span>
                                <span className="font-bold text-purple-900">
                                  IDR{" "}
                                  {booking.refund_amount?.toLocaleString(
                                    "id-ID",
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-800">
                                  Refund Method:
                                </span>
                                <span className="font-medium">
                                  {booking.refund_method}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-800">
                                  Refund Date:
                                </span>
                                <span className="font-medium">
                                  {booking.refund_date
                                    ? new Date(
                                        booking.refund_date,
                                      ).toLocaleString("en-ID")
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
                              {booking.refund_status === "COMPLETED" &&
                                " (Refunded)"}
                            </h4>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-800">
                                Deposit Paid
                              </span>
                              <span className="font-medium">
                                IDR{" "}
                                {booking.deposit_amount.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          {/* Venue Payment Status */}
                          {booking.venue_payment_received ? (
                            // Venue payment collected
                            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                              <h4 className="font-semibold text-green-900 text-sm mb-2">
                                Venue Payment
                                {booking.refund_status === "COMPLETED" &&
                                  " (Refunded)"}
                              </h4>
                              <div className="flex justify-between text-sm font-semibold">
                                <span className="text-green-800">
                                  Collected
                                </span>
                                <span
                                  className={`text-green-700 ${
                                    booking.refund_status === "COMPLETED"
                                      ? "line-through"
                                      : ""
                                  }`}
                                >
                                  IDR{" "}
                                  {booking.venue_payment_amount.toLocaleString(
                                    "id-ID",
                                  )}
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
                                <span className="text-red-800">
                                  Not Collected
                                </span>
                                <span className="text-red-700 line-through">
                                  IDR{" "}
                                  {booking.remaining_balance.toLocaleString(
                                    "id-ID",
                                  )}
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
                                <span className="text-gray-800">
                                  Not Collected
                                </span>
                                <span className="text-gray-700 line-through">
                                  IDR{" "}
                                  {booking.remaining_balance.toLocaleString(
                                    "id-ID",
                                  )}
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
                                <span className="text-orange-800">
                                  To Pay at Venue
                                </span>
                                <span className="text-orange-700">
                                  IDR{" "}
                                  {booking.remaining_balance.toLocaleString(
                                    "id-ID",
                                  )}
                                </span>
                              </div>
                            </div>
                          )}

                          <Separator />

                          {/* Total Booking Value */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium">
                                Total Booking Value{" "}
                                {booking.refund_status === "COMPLETED"
                                  ? "(Before Refunded)"
                                  : ""}
                              </p>
                              <span className="text-green-700 text-2xl font-bold">
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
                              {booking.refund_status === "COMPLETED" &&
                                " (Before Refunded)"}
                            </h4>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-800">Paid Online</span>
                              <span className="font-medium">
                                IDR{" "}
                                {booking.total_amount.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          <Separator />

                          {/* Total Booking Value */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium">
                                Total Booking Value{" "}
                                {booking.refund_status === "COMPLETED"
                                  ? "(Before Refunded)"
                                  : ""}
                              </p>
                              <span className="text-green-700 text-2xl font-bold">
                                IDR {booking.subtotal.toLocaleString("id-ID")}
                              </span>
                            </div>
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
                              {new Date(booking.paid_at).toLocaleString(
                                "en-ID",
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Need Help */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Need Help?
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Questions about your booking?
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>📱 WhatsApp: +62 812 3955 3510</p>
                        <p>📧 Email: info@padelbap.com</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Dialog */}
          {booking && (
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cancel Booking</DialogTitle>
                  <DialogDescription>
                    Cancel booking {booking.booking_ref}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Cancellation Policy Notice */}
                  {/* Cancellation Policy Notice */}
                  <Alert
                    className={
                      getRefundType(booking) === "FULL"
                        ? "bg-green-50 border-green-200"
                        : getRefundType(booking) === "PARTIAL"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-orange-50 border-orange-200"
                    }
                  >
                    <AlertCircle
                      className={`h-4 w-4 ${
                        getRefundType(booking) === "FULL"
                          ? "text-green-600"
                          : getRefundType(booking) === "PARTIAL"
                            ? "text-blue-600"
                            : "text-orange-600"
                      }`}
                    />
                    <AlertDescription
                      className={
                        getRefundType(booking) === "FULL"
                          ? "text-green-800"
                          : getRefundType(booking) === "PARTIAL"
                            ? "text-blue-800"
                            : "text-orange-800"
                      }
                    >
                      {getRefundType(booking) === "FULL" ? (
                        <>
                          <strong>✅ Full Refund (100%)</strong>
                          <p className="text-sm mt-1">
                            Session starts in {getHoursUntilBooking(booking)}{" "}
                            hours (≥24hrs before). You will receive:{" "}
                            <strong>
                              IDR {booking.total_amount.toLocaleString("id-ID")}
                            </strong>
                          </p>
                        </>
                      ) : getRefundType(booking) === "PARTIAL" ? (
                        <>
                          <strong>⚖️ Partial Refund (50%)</strong>
                          <p className="text-sm mt-1">
                            Session starts in {getHoursUntilBooking(booking)}{" "}
                            hours (12-24hrs before). You will receive:{" "}
                            <strong>
                              IDR{" "}
                              {calculateRefundAmount(booking).toLocaleString(
                                "id-ID",
                              )}
                            </strong>
                          </p>
                        </>
                      ) : (
                        <>
                          <strong>⚠️ No Refund</strong>
                          <p className="text-sm mt-1">
                            Session starts in {getHoursUntilBooking(booking)}{" "}
                            hours (&lt;12hrs before). Per our policy, no refund
                            can be issued.
                          </p>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Booking Details Summary */}
                  <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Court:</span>
                      <span className="font-medium">
                        {booking.courts?.name}
                      </span>
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
                      <span className="text-muted-foreground">
                        Amount Paid:
                      </span>
                      <span className="font-medium">
                        IDR {booking.total_amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Cancellation Reason */}
                  <div>
                    <Label htmlFor="cancelReason">
                      Reason for Cancellation *
                    </Label>
                    <Textarea
                      id="cancelReason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please tell us why you need to cancel (e.g., scheduling conflict, emergency, etc.)"
                      className="mt-2"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This helps us improve our service
                    </p>
                  </div>

                  {/* Warning */}
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">
                      <strong>Warning:</strong> This action cannot be undone.
                      Your booking will be cancelled immediately.
                    </AlertDescription>
                  </Alert>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
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
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyBookingClient;

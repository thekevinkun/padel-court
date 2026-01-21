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
  CheckCircle,
  XCircle,
  Info,
  PlayCircle,
  Trophy,
  Phone,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { Booking } from "@/types/booking";
import { getDisplayStatus, getDisplayStatusStyle } from "@/lib/booking";

const MyBookingClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get params from URL
  const urlEmail = searchParams.get("email");
  const urlBookingRef = searchParams.get("booking_ref");

  const [email, setEmail] = useState(urlEmail || "");
  const [bookingRef, setBookingRef] = useState(urlBookingRef || "");
  const [loading, setLoading] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [isAlreadyLookup, setIsAlreadyLookup] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  // Auto-lookup if URL has params
  useEffect(() => {
    const checkUrlForLookup = async () => {
      if (urlEmail && urlBookingRef) {
        setLoadingLookup(true);
        await handleLookup(null, urlEmail, urlBookingRef);
        setLoadingLookup(false);
      }
    };

    if (!isAlreadyLookup) checkUrlForLookup();
  }, [urlEmail, urlBookingRef]);

  const handleLookup = async (
    e: React.FormEvent | null,
    paramEmail?: string,
    paramBookingRef?: string,
  ) => {
    if (e) e.preventDefault();

    setIsAlreadyLookup(false);
    setLoading(true);
    setError("");
    setBooking(null);

    const lookupEmail = paramEmail || email;
    const lookupRef = paramBookingRef || bookingRef;

    try {
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
    } catch (err) {
      console.error("Lookup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setIsAlreadyLookup(true);
    }
  };

  const handleReset = () => {
    setEmail("");
    setBookingRef("");
    setError("");
    setBooking(null);
    router.push("/my-booking"); // Clear URL params
  };

  // Check if booking has expired (date passed)
  const isBookingExpired = (booking: Booking) => {
    const bookingDate = new Date(booking.date);

    const timeEnd = booking.time.split(" - ")[1]; // "09:00 - 10:00" -> "10:00"
    const [hours, minutes] = timeEnd.split(":").map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);

    return new Date() > bookingDate;
  };

  // Get display status badge
  const getStatusBadge = (booking: Booking) => {
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
  };

  // Get session status badge
  const getSessionBadge = (sessionStatus: string) => {
    const styles: Record<string, string> = {
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
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
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

              {/* EXPIRED Badge (if booking date passed) */}
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
                      This booking has been refunded due to customer cancellation.
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
                              "id-ID",
                              {
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
                          <p className="font-medium">{booking.time}</p>
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
                              "id-ID",
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
                                "id-ID",
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
                  <div className="flex justify-end">
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
                      {/* Show Refund Notice First if Refunded */}
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
                                      ).toLocaleString("id-ID")
                                    : "-"}
                                </span>
                              </div>
                              {booking.refund_reason && (
                                <div className="pt-2 border-t border-purple-200">
                                  <span className="text-purple-800 text-xs">
                                    Reason:
                                  </span>
                                  <p className="text-purple-900 text-xs mt-1">
                                    {booking.refund_reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Separator />
                        </>
                      )}

                      {/* Court Booking */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Court Booking{" "}
                            {booking.refund_status === "COMPLETED" &&
                              "(REFUNDED)"}
                          </span>
                          <span
                            className={`font-medium ${booking.refund_status === "COMPLETED" ? "line-through text-gray-400" : ""}`}
                          >
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
                              <span className="text-blue-800">
                                Deposit Paid
                              </span>
                              <span
                                className={`font-medium ${booking.refund_status === "COMPLETED" ? "line-through text-gray-400" : ""}`}
                              >
                                IDR{" "}
                                {booking.deposit_amount.toLocaleString("id-ID")}
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
                                <span className="text-green-800">
                                  Collected
                                </span>
                                <span className="text-green-700">
                                  IDR{" "}
                                  {booking.venue_payment_amount.toLocaleString(
                                    "id-ID",
                                  )}
                                </span>
                              </div>
                            </div>
                          ) : booking.refund_status === "COMPLETED" ? (
                            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                              <h4 className="font-semibold text-purple-900 text-sm mb-2">
                                Venue Payment (CANCELLED)
                              </h4>
                              <div className="flex justify-between text-sm font-semibold">
                                <span className="text-purple-800">
                                  Refunded
                                </span>
                                <span className="text-purple-700/55 line-through">
                                  IDR{" "}
                                  {booking.remaining_balance.toLocaleString(
                                    "id-ID",
                                  )}
                                </span>
                              </div>
                            </div>
                          ) : booking.venue_payment_expired ? (
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                                Venue Payment (Expired)
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
                            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                              <h4 className="font-semibold text-orange-900 text-sm mb-2">
                                Venue Payment (Pending)
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

                          {/* Total Revenue */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-green-800 font-medium">
                                  Total Booking Value
                                </p>
                              </div>
                              <span
                                className={`text-2xl font-bold text-green-700 ${
                                  booking.refund_status === "COMPLETED" &&
                                  "line-through text-green-700/55"
                                }`}
                              >
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
                              <span className="text-blue-800">Paid Online</span>
                              <span
                                className={`font-medium ${booking.refund_status === "COMPLETED" && "line-through"}`}
                              >
                                IDR{" "}
                                {booking.total_amount.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          <Separator />

                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-green-800 font-medium">
                                Total Booking Value
                              </p>
                              <span
                                className={`text-2xl font-bold ${
                                  booking.refund_status === "COMPLETED"
                                    ? "text-purple-700 line-through"
                                    : "text-green-700"
                                }`}
                              >
                                IDR {booking.subtotal.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Payment Method */}
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
                                "id-ID",
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
        </motion.div>
      </div>
    </div>
  );
};

export default MyBookingClient;

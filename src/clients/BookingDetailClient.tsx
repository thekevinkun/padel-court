"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  DollarSign,
  Wallet,
  Calendar,
  MapPin,
  Users,
  Mail,
  Phone,
  MessageCircle,
  AlertCircle,
  Loader2,
  Receipt,
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
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/lib/supabase/client";

const BookingDetailClient = ({ bookingId }: { bookingId: string }) => {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [recording, setRecording] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [notes, setNotes] = useState("");

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
        throw new Error(errorData.error || "Failed to record payment");
      }

      const data = await response.json();
      console.log("✅ Payment recorded:", data);

      // Refresh booking data
      await fetchBooking();

      // Close dialog
      setPaymentDialogOpen(false);
      setNotes("");
      setPaymentMethod("CASH");

      // Show success message
      alert(
        `✅ Payment recorded successfully!\n\nIDR ${booking.remaining_balance.toLocaleString(
          "id-ID"
        )} received via ${paymentMethod}`
      );
    } catch (error: any) {
      console.error("Error recording payment:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setRecording(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      CANCELLED: "bg-red-100 text-red-800",
      EXPIRED: "bg-gray-100 text-gray-800",
    };
    const icons = {
      PAID: CheckCircle,
      PENDING: Clock,
      CANCELLED: XCircle,
      EXPIRED: XCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return (
      <Badge className={`${styles[status as keyof typeof styles]} text-sm`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
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
        <Button onClick={() => router.push("/admin/bookings")} variant="outline">
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
    booking.remaining_balance > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        {getStatusBadge(booking.status)}
      </div>

      {/* Venue Payment Alert */}
      {needsVenuePayment && (
        <Alert className="bg-orange-50 border-orange-200">
          <Wallet className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between gap-5">
              <div>
                <strong>⏳ Awaiting Venue Payment</strong>
                <p className="text-sm mt-1">
                  Customer needs to pay IDR{" "}
                  {booking.remaining_balance.toLocaleString("id-ID")} at venue
                </p>
              </div>
              <Button
                onClick={() => setPaymentDialogOpen(true)}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </div>
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
              Received IDR {booking.venue_payment_amount.toLocaleString("id-ID")}{" "}
              via {booking.venue_payment_method} on{" "}
              {new Date(booking.venue_payment_date).toLocaleString("id-ID")}
            </p>
          </AlertDescription>
        </Alert>
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
                    <p className="font-medium">{booking.courts.name}</p>
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
                  <span className="text-muted-foreground">🎾 Court Booking</span>
                  <span className="font-medium">
                    IDR {booking.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Deposit or Full Payment */}
              {booking.require_deposit ? (
                <>
                  {/* Online Deposit */}
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg space-y-2">
                    <h4 className="font-semibold text-blue-900 text-sm">
                      💳 Online Deposit Payment
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
                        ✅ Venue Payment (Cash)
                      </h4>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-green-800">Collected</span>
                        <span className="text-green-700">
                          IDR {booking.venue_payment_amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <h4 className="font-semibold text-orange-900 text-sm mb-2">
                        ⏳ Venue Payment (Pending)
                      </h4>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-orange-800">To Collect</span>
                        <span className="text-orange-700">
                          IDR {booking.remaining_balance.toLocaleString("id-ID")}
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
                      💳 Full Payment Online
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
                  <SelectItem value="BANK_TRANSFER">🏦 Bank Transfer</SelectItem>
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

            {/* Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This will mark the booking as fully paid and update the financial
                records. This action cannot be undone.
              </AlertDescription>
            </Alert>

            {/* Actions */}
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
                className="flex-1 bg-green-600 hover:bg-green-700"
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
    </div>
  );
};

export default BookingDetailClient;
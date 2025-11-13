"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { supabase } from "@/lib/supabase/client";

const BookingsPageClient = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
            *,
            courts (name, description)
            `
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookings(data);
        setFilteredBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customer_name.toLowerCase().includes(query) ||
          b.booking_ref.toLowerCase().includes(query) ||
          b.customer_email.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      "Booking Ref",
      "Customer Name",
      "Email",
      "Phone",
      "Court",
      "Date",
      "Time",
      "Players",
      "Deposit Required",
      "Deposit Amount",
      "Total Paid",
      "Remaining Balance",
      "Status",
      "Created At",
    ];

    const rows = filteredBookings.map((b) => [
      b.booking_ref,
      b.customer_name,
      b.customer_email,
      b.customer_phone,
      b.courts.name,
      b.date,
      b.time,
      b.number_of_players,
      b.require_deposit ? "Yes" : "No",
      b.deposit_amount || 0,
      b.total_amount,
      b.remaining_balance || 0,
      b.status,
      new Date(b.created_at).toLocaleString("id-ID"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
      <Badge className={styles[status as keyof typeof styles] || ""}>
        <Icon className="w-3 h-3 mr-1" />
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or booking ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="w-full lg:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="!pb-1">
        <CardContent className="p-0">
          <div className="rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Booking Ref</TableHead>
                  <TableHead className="font-medium">Customer</TableHead>
                  <TableHead className="font-medium">Court</TableHead>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Time</TableHead>
                  <TableHead className="font-medium">Amount Paid</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <p className="text-muted-foreground">No bookings found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {booking.booking_ref}
                        {booking.require_deposit && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Deposit
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.customer_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.customer_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {booking.courts.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(booking.date).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-sm">{booking.time}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          IDR {booking.total_amount.toLocaleString("id-ID")}
                        </div>
                        {booking.require_deposit &&
                          booking.remaining_balance > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              Balance: IDR{" "}
                              {booking.remaining_balance.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Reference */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Booking Reference
                  </p>
                  <p className="text-2xl font-bold font-mono">
                    {selectedBooking.booking_ref}
                  </p>
                  {selectedBooking.require_deposit && (
                    <Badge variant="outline" className="mt-2">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Deposit Payment
                    </Badge>
                  )}
                </div>
                {getStatusBadge(selectedBooking.status)}
              </div>

              <Separator />

              {/* Deposit Alert */}
              {selectedBooking.require_deposit &&
                selectedBooking.remaining_balance > 0 && (
                  <Alert className="bg-orange-50 border-orange-200">
                    <Info className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-sm text-orange-800">
                      <strong>Deposit Booking:</strong> Customer paid deposit of{" "}
                      <strong>
                        IDR{" "}
                        {selectedBooking.deposit_amount.toLocaleString("id-ID")}
                      </strong>{" "}
                      online.
                      <br />
                      <strong>
                        Remaining balance of IDR{" "}
                        {selectedBooking.remaining_balance.toLocaleString(
                          "id-ID"
                        )}
                      </strong>{" "}
                      must be collected at venue.
                    </AlertDescription>
                  </Alert>
                )}

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedBooking.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {selectedBooking.customer_email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {selectedBooking.customer_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">
                      {selectedBooking.customer_whatsapp}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Court</p>
                    <p className="font-medium">{selectedBooking.courts.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.date).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{selectedBooking.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Players</p>
                    <p className="font-medium">
                      {selectedBooking.number_of_players}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold mb-3">
                  Payment & Revenue Information
                </h3>
                <div className="space-y-3">
                  {/* Court booking base price */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Court Booking:
                      </span>
                      <span className="font-medium">
                        IDR {selectedBooking.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* DEPOSIT PAYMENT BREAKDOWN */}
                  {selectedBooking.require_deposit ? (
                    <>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                          Online Deposit Payment
                        </h4>

                        {/* What customer paid online */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-800">
                              Customer Paid Online:
                            </span>
                            <span className="font-bold text-blue-900">
                              IDR{" "}
                              {selectedBooking.total_amount.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between text-xs pl-4">
                            <span className="text-blue-700">
                              └─ Deposit (
                              {Math.round(
                                (selectedBooking.deposit_amount /
                                  selectedBooking.subtotal) *
                                  100
                              )}
                              %)
                            </span>
                            <span className="text-blue-800">
                              IDR{" "}
                              {selectedBooking.deposit_amount.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between text-xs pl-4">
                            <span className="text-blue-700">
                              └─ Midtrans Processing Fee
                            </span>
                            <span className="text-red-600">
                              - IDR{" "}
                              {selectedBooking.payment_fee.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                        </div>

                        <Separator className="bg-blue-200" />

                        {/* Net received from online */}
                        <div className="flex justify-between font-semibold text-green-700 bg-green-50 p-2 rounded">
                          <span>You Received (Net from Online):</span>
                          <span>
                            IDR{" "}
                            {(
                              selectedBooking.total_amount -
                              selectedBooking.payment_fee
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Venue payment (remaining balance) */}
                      {selectedBooking.remaining_balance > 0 && (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                          <h4 className="font-semibold text-orange-900 text-sm flex items-center gap-2 mb-2">
                            Cash Payment at Venue
                          </h4>

                          <div className="flex justify-between font-semibold text-orange-800">
                            <span>To Collect (No fees):</span>
                            <span className="text-lg">
                              IDR{" "}
                              {selectedBooking.remaining_balance.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>

                          <p className="text-xs text-orange-700 mt-2">
                            This is the remaining{" "}
                            {100 -
                              Math.round(
                                (selectedBooking.deposit_amount /
                                  selectedBooking.subtotal) *
                                  100
                              )}
                            % of the booking - collect in cash when customer
                            arrives
                          </p>
                        </div>
                      )}

                      <Separator />

                      {/* TOTAL BUSINESS REVENUE */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-green-800 font-medium">
                              Total Business Revenue
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              Online:{" "}
                              {selectedBooking.deposit_amount.toLocaleString(
                                "id-ID"
                              )}{" "}
                              + Venue:{" "}
                              {selectedBooking.remaining_balance.toLocaleString(
                                "id-ID"
                              )}
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-green-700">
                            IDR{" "}
                            {(
                              selectedBooking.deposit_amount +
                              selectedBooking.remaining_balance
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Fee absorbed note */}
                      <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 border-l-4 border-gray-400">
                        <strong>Note:</strong> Midtrans fee (IDR{" "}
                        {selectedBooking.payment_fee.toLocaleString("id-ID")})
                        was absorbed by your business to provide better customer
                        experience.
                      </div>
                    </>
                  ) : (
                    /* FULL PAYMENT BREAKDOWN */
                    <>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                          <span className="text-lg">💳</span> Full Payment
                          Online
                        </h4>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-800">
                              Customer Paid:
                            </span>
                            <span className="font-bold text-blue-900">
                              IDR{" "}
                              {selectedBooking.total_amount.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between text-xs pl-4">
                            <span className="text-blue-700">
                              └─ Booking Amount
                            </span>
                            <span className="text-blue-800">
                              IDR{" "}
                              {selectedBooking.subtotal.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex justify-between text-xs pl-4">
                            <span className="text-blue-700">
                              └─ Midtrans Processing Fee
                            </span>
                            <span className="text-red-600">
                              - IDR{" "}
                              {selectedBooking.payment_fee.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                        </div>

                        <Separator className="bg-blue-200" />

                        <div className="flex justify-between font-semibold text-green-700 bg-green-50 p-2 rounded">
                          <span>You Received (Net):</span>
                          <span>
                            IDR{" "}
                            {(
                              selectedBooking.total_amount -
                              selectedBooking.payment_fee
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      {/* TOTAL REVENUE */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-green-800 font-medium">
                            Total Business Revenue
                          </p>
                          <span className="text-2xl font-bold text-green-700">
                            IDR{" "}
                            {selectedBooking.subtotal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Fee absorbed note */}
                      <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 border-l-4 border-gray-400">
                        <strong>ℹ️ Note:</strong> Midtrans fee (IDR{" "}
                        {selectedBooking.payment_fee.toLocaleString("id-ID")})
                        was absorbed by your business to provide better customer
                        experience.
                      </div>
                    </>
                  )}

                  {/* Payment method info */}
                  <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                    <span className="text-muted-foreground">
                      Payment Method:
                    </span>
                    <span className="font-medium uppercase">
                      {selectedBooking.payment_method || "N/A"}
                    </span>
                  </div>

                  {selectedBooking.paid_at && (
                    <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                      <span className="text-muted-foreground">Paid At:</span>
                      <span className="font-medium">
                        {new Date(selectedBooking.paid_at).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetailsOpen(false)}
                >
                  Close
                </Button>
                {selectedBooking.status === "PAID" && (
                  <Button variant="destructive" className="flex-1">
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPageClient;

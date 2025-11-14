// /src/clients/BookingsPageClient.tsx
// UPDATED VERSION - Replace your existing file

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  DollarSign,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { supabase } from "@/lib/supabase/client";

const BookingsPageClient = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [venuePaymentFilter, setVenuePaymentFilter] = useState("ALL"); // NEW

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, venuePaymentFilter, bookings]);

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

    // NEW: Filter by venue payment status
    if (venuePaymentFilter === "PENDING") {
      filtered = filtered.filter(
        (b) =>
          b.status === "PAID" &&
          b.require_deposit &&
          !b.venue_payment_received &&
          b.remaining_balance > 0
      );
    } else if (venuePaymentFilter === "COMPLETED") {
      filtered = filtered.filter(
        (b) => b.venue_payment_received || !b.require_deposit
      );
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
      "Venue Payment",
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
      b.venue_payment_received ? "Received" : "Pending",
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

  // NEW: Get venue payment status badge
  const getVenuePaymentBadge = (booking: any) => {
    if (!booking.require_deposit) {
      return (
        <Badge variant="secondary" className="text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Full Payment
        </Badge>
      );
    }

    if (booking.venue_payment_received) {
      return (
        <Badge className="bg-green-100 text-green-800 text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }

    if (booking.status === "PAID" && booking.remaining_balance > 0) {
      return (
        <Badge className="bg-orange-100 text-orange-800 text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  // NEW: Calculate pending venue payments
  const pendingVenuePayments = bookings.filter(
    (b) =>
      b.status === "PAID" &&
      b.require_deposit &&
      !b.venue_payment_received &&
      b.remaining_balance > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Pending Venue Payments Alert */}
      {pendingVenuePayments > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">
                  {pendingVenuePayments} Booking
                  {pendingVenuePayments > 1 ? "s" : ""} Awaiting Venue Payment
                </p>
                <p className="text-sm text-orange-700">
                  Customers need to pay remaining balance at venue
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVenuePaymentFilter("PENDING")}
                className="border-orange-300 hover:bg-orange-100"
              >
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

            {/* NEW: Venue Payment Filter */}
            <Select
              value={venuePaymentFilter}
              onValueChange={setVenuePaymentFilter}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Venue payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Payments</SelectItem>
                <SelectItem value="PENDING">⏳ Pending Venue</SelectItem>
                <SelectItem value="COMPLETED">✓ Completed</SelectItem>
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
                  <TableHead className="font-medium">Amount</TableHead>
                  <TableHead className="font-medium">Venue Payment</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
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
                      {/* NEW: Venue Payment Status Column */}
                      <TableCell>{getVenuePaymentBadge(booking)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsPageClient;

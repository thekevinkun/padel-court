"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  Trophy,
  AlertCircle,
  Wallet,
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
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [venuePaymentFilter, setVenuePaymentFilter] = useState(
    searchParams.get("filter") === "venue_pending" ? "PENDING" : "ALL"
  );
  const [sessionFilter, setSessionFilter] = useState("ALL"); // NEW

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, venuePaymentFilter, sessionFilter, bookings]);

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

    // Filter by payment status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by venue payment status
    if (venuePaymentFilter === "PENDING") {
      filtered = filtered.filter(
        (b) =>
          b.status === "PAID" &&
          b.require_deposit &&
          !b.venue_payment_received &&
          !b.venue_payment_expired &&
          b.remaining_balance > 0
      );
    } else if (venuePaymentFilter === "COMPLETED") {
      filtered = filtered.filter(
        (b) => b.venue_payment_received || !b.require_deposit
      );
    } else if (venuePaymentFilter === "EXPIRED") {
      filtered = filtered.filter((b) => b.venue_payment_expired);
    }

    // NEW: Filter by session status
    if (sessionFilter !== "ALL") {
      filtered = filtered.filter((b) => b.session_status === sessionFilter);
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
      "Payment Choice",
      "Deposit Amount",
      "Total Paid",
      "Venue Payment",
      "Remaining Balance",
      "Payment Status",
      "Session Status",
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
      b.customer_payment_choice || "N/A",
      b.deposit_amount || 0,
      b.total_amount,
      b.venue_payment_received
        ? "Received"
        : b.venue_payment_expired
        ? "Expired"
        : "Pending",
      b.remaining_balance || 0,
      b.status,
      b.session_status,
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

  // NEW: Session status badge
  const getSessionBadge = (sessionStatus: string) => {
    const styles = {
      UPCOMING: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
    };
    const icons = {
      UPCOMING: Clock,
      IN_PROGRESS: PlayCircle,
      COMPLETED: Trophy,
    };
    const Icon = icons[sessionStatus as keyof typeof icons] || Clock;
    const label = sessionStatus.replace("_", " ");

    return (
      <Badge
        className={`${styles[sessionStatus as keyof typeof styles]} text-xs`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // NEW: Venue payment badge with expired state
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

    if (booking.venue_payment_expired) {
      return (
        <Badge className="bg-gray-100 text-gray-800 text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
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

  // Calculate pending venue payments (non-expired only)
  const pendingVenuePayments = bookings.filter(
    (b) =>
      b.status === "PAID" &&
      b.require_deposit &&
      !b.venue_payment_received &&
      !b.venue_payment_expired &&
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

            {/* Payment Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Payments</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Venue Payment Filter */}
            <Select
              value={venuePaymentFilter}
              onValueChange={setVenuePaymentFilter}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Venue payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Venue</SelectItem>
                <SelectItem value="PENDING">💵 Pending</SelectItem>
                <SelectItem value="COMPLETED">✓ Completed</SelectItem>
                <SelectItem value="EXPIRED">⏰ Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* NEW: Session Status Filter */}
            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Session status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sessions</SelectItem>
                <SelectItem value="UPCOMING">⏳ Upcoming</SelectItem>
                <SelectItem value="IN_PROGRESS">🎾 In Progress</SelectItem>
                <SelectItem value="COMPLETED">🏁 Completed</SelectItem>
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
                  <TableHead className="font-medium">Date & Time</TableHead>
                  <TableHead className="font-medium">Amount</TableHead>
                  <TableHead className="font-medium">Venue Payment</TableHead>
                  <TableHead className="font-medium">Session</TableHead>
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
                        {booking.customer_payment_choice === "DEPOSIT" && (
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
                        <div>
                          {new Date(booking.date).toLocaleDateString("id-ID")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          IDR {booking.total_amount.toLocaleString("id-ID")}
                        </div>
                        {booking.require_deposit &&
                          booking.remaining_balance > 0 &&
                          !booking.venue_payment_expired && (
                            <div className="text-xs text-orange-600 mt-1">
                              Balance: IDR{" "}
                              {booking.remaining_balance.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>{getVenuePaymentBadge(booking)}</TableCell>
                      <TableCell>
                        {getSessionBadge(booking.session_status)}
                      </TableCell>
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

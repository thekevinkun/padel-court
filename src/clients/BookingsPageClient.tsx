"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Download, Eye, Info, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";
import { Booking } from "@/types/booking";
import { supabase } from "@/lib/supabase/client";
import {
  getSessionStatusColor,
  getSessionStatusIcon,
  getDisplayStatus,
  getDisplayStatusStyle,
  getDisplayStatusIcon,
} from "@/lib/booking";

const BookingsPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial filter from URL
  const urlFilter = searchParams.get("filter");

  const getInitialFilters = () => {
    switch (urlFilter) {
      case "upcoming":
        return { status: "ALL", session: "UPCOMING" };
      case "venue_pending":
        return { status: "DEPOSIT PAID", session: "UPCOMING" };
      case "in_progress":
        return { status: "ALL", session: "IN_PROGRESS" };
      case "completed":
        return { status: "ALL", session: "COMPLETED" };
      default:
        return { status: "ALL", session: "ALL" };
    }
  };

  // Set initial filters
  const initialFilters = getInitialFilters();

  // Original bookings from fetch
  const [fetchedBookings, setFetchedBookings] = useState<Booking[]>([]);

  // Real-time bookings (synced automatically)
  const { bookings } = useRealtimeBookings(fetchedBookings);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Store bookings after filet
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // State for all booking dashboard tools
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialFilters.status);
  const [sessionFilter, setSessionFilter] = useState(initialFilters.session);

  // Track if any filter is active (URL or manual)
  const hasActiveFilters =
    statusFilter !== "ALL" ||
    sessionFilter !== "ALL" ||
    searchQuery.length > 0 ||
    urlFilter !== null;

  // Get bookings on initial
  useEffect(() => {
    fetchBookings();
  }, []);

  // Sync filters when URL changes (e.g., when navigating from dashboard)
  useEffect(() => {
    const newFilters = getInitialFilters();
    setStatusFilter(newFilters.status);
    setSessionFilter(newFilters.session);
    setSearchQuery(""); // Reset search when URL filter changes
  }, [urlFilter]);

  // Get and show filter bookings whenever one of the tools (on dependecies) execute/change
  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, sessionFilter, bookings]);

  // Function to fetch bookings
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
    *,
    courts (name, description),
    booking_time_slots (
      id,
      time_slots (time_start, time_end)
    ),
    booking_equipment (
      id,
      quantity,
      equipment (name)
    ),
    booking_players (
      id,
      player_name,
      is_primary_booker
    )
  `,
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        setFetchedBookings(data || []);
        setFilteredBookings(data);
      }
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

  // Function to fetch bookings by/after filtered
  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by display status (combines payment + venue payment)
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => getDisplayStatus(b) === statusFilter);
    }

    // Filter by session status
    if (sessionFilter !== "ALL") {
      filtered = filtered.filter((b) => b.session_status === sessionFilter);
    }

    // Special filter: venue_pending (deposit paid but venue payment not received)
    if (statusFilter === "DEPOSIT PAID") {
      // Further filter to only show those awaiting venue payment
      filtered = filtered.filter(
        (b) =>
          b.require_deposit &&
          !b.venue_payment_received &&
          !b.venue_payment_expired &&
          b.remaining_balance > 0,
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customer_name.toLowerCase().includes(query) ||
          b.booking_ref.toLowerCase().includes(query) ||
          b.customer_email.toLowerCase().includes(query),
      );
    }

    setFilteredBookings(filtered);
  };

  // Function for export to csv
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
      "Total Paid",
      "Display Status",
      "Session Status",
      "Created At",
    ];

    const rows = filteredBookings.map((b) => [
      b.booking_ref,
      b.customer_name,
      b.customer_email,
      b.customer_phone,
      b?.courts?.name,
      b.date,
      b.time,
      b.number_of_players,
      b.customer_payment_choice || "N/A",
      b.total_amount,
      getDisplayStatus(b),
      b.session_status,
      new Date(b.created_at).toLocaleString("en-ID"),
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          {/* Active Filter Indicator */}
          {hasActiveFilters && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Active filters:</strong>{" "}
                {urlFilter === "upcoming" && "Upcoming sessions"}
                {urlFilter === "venue_pending" && "Awaiting venue payment"}
                {urlFilter === "in_progress" && "Sessions in progress"}
                {urlFilter === "completed" && "Completed sessions"}
                {!urlFilter &&
                  statusFilter !== "ALL" &&
                  `Status: ${statusFilter}`}
                {!urlFilter &&
                  sessionFilter !== "ALL" &&
                  `Session: ${sessionFilter.replace("_", " ")}`}
                {!urlFilter && searchQuery && `Search: "${searchQuery}"`}
              </AlertDescription>
            </Alert>
          )}

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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PAID">✓ Paid</SelectItem>
                <SelectItem value="DEPOSIT PAID">💰 Deposit Paid</SelectItem>
                <SelectItem value="REFUNDED">💲 Refunded</SelectItem>
                <SelectItem value="PAYMENT EXPIRED">
                  ⏰ Payment Expired
                </SelectItem>
                <SelectItem value="PENDING">⏳ Pending</SelectItem>
                <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Session Status Filter */}
            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Session status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sessions</SelectItem>
                <SelectItem value="UPCOMING">⏳ Upcoming</SelectItem>
                <SelectItem value="IN_PROGRESS">🎾 In Progress</SelectItem>
                <SelectItem value="COMPLETED">🏁 Completed</SelectItem>
                <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button (only show if URL filter is active) */}
            {hasActiveFilters && (
              <Button
                onClick={() => {
                  setStatusFilter("ALL");
                  setSessionFilter("ALL");
                  setSearchQuery("");
                  // If there's a URL filter, navigate to clear it
                  if (urlFilter) {
                    router.push("/admin/bookings");
                  }
                }}
                variant="ghost"
                className="w-full lg:w-auto"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}

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
            {hasActiveFilters && filteredBookings.length < bookings.length && (
              <span className="text-blue-600 ml-2">
                ({bookings.length - filteredBookings.length} filtered out)
              </span>
            )}
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
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Session</TableHead>
                  <TableHead className="font-medium sr-only">Actions</TableHead>
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
                      <TableCell>
                        <div className="font-mono text-sm font-medium">
                          {booking.customer_payment_choice === "DEPOSIT" && (
                            <Badge variant="outline" className="text-xs">
                              Deposit
                            </Badge>
                          )}
                          <div>
                            {booking.booking_ref}
                          </div>
                        </div>
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
                        {booking?.courts?.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          {new Date(booking.date).toLocaleDateString("en-ID")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.time}
                          {booking.duration_hours > 1 && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              {booking.duration_hours}h
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          IDR {booking.total_amount.toLocaleString("id-ID")}
                        </div>
                        {booking.refund_status === "COMPLETED" ? (
                          <div className="text-xs text-orange-600 mt-1">
                            Refunded: IDR{" "}
                            {booking.refund_amount.toLocaleString("id-ID")}
                          </div>
                        ) : (
                          booking.require_deposit && (
                            <div className="text-xs text-orange-600 mt-1">
                              {booking.remaining_balance > 0
                                ? "Balance: IDR " +
                                  booking.remaining_balance.toLocaleString(
                                    "id-ID",
                                  )
                                : "Venue: IDR " +
                                  booking.venue_payment_amount.toLocaleString(
                                    "id-ID",
                                  )}
                              {"\n"}
                              {booking.venue_payment_expired
                                ? "(Expired)"
                                : booking.status === "REFUNDED" ||
                                    booking.session_status === "CANCELLED"
                                  ? "(Cancelled)"
                                  : ""}
                            </div>
                          )
                        )}

                        {/* Equipment & Players Badges */}
                        <div className="flex gap-1 mt-2">
                          {booking.has_equipment_rental && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                            >
                              🎾 Equipment
                            </Badge>
                          )}
                          {booking.booking_players &&
                            booking.booking_players.length > 1 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-300"
                              >
                                👥 {booking.booking_players.length}
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking)}</TableCell>
                      <TableCell>
                        {getSessionBadge(booking.session_status)}
                      </TableCell>
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

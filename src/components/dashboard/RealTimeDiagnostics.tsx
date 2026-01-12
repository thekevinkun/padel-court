"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { supabase } from "@/lib/supabase/client";

const RealtimeDiagnostic = () => {
  const [bookingsStatus, setBookingsStatus] = useState<string>("connecting");
  const [notificationsStatus, setNotificationsStatus] =
    useState<string>("connecting");
  const [lastBookingEvent, setLastBookingEvent] =
    useState<string>("Waiting...");
  const [lastNotificationEvent, setLastNotificationEvent] =
    useState<string>("Waiting...");

  useEffect(() => {
    // Test bookings channel
    const bookingsChannel = supabase
      .channel("diagnostic_bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          setLastBookingEvent(
            `${payload.eventType} at ${new Date().toLocaleTimeString()}`
          );
          console.log("📅 Bookings event:", payload);
        }
      )
      .subscribe((status) => {
        setBookingsStatus(status);
        console.log("📅 Bookings subscription:", status);
      });

    // Test notifications channel
    const notificationsChannel = supabase
      .channel("diagnostic_notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        (payload) => {
          setLastNotificationEvent(
            `${payload.eventType} at ${new Date().toLocaleTimeString()}`
          );
          console.log("🔔 Notifications event:", payload);
        }
      )
      .subscribe((status) => {
        setNotificationsStatus(status);
        console.log("🔔 Notifications subscription:", status);
      });

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === "SUBSCRIBED")
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "CLOSED" || status === "CHANNEL_ERROR")
      return <XCircle className="h-5 w-5 text-red-600" />;
    return <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "SUBSCRIBED")
      return <Badge className="bg-green-600">Connected</Badge>;
    if (status === "CLOSED")
      return <Badge variant="destructive">Disconnected</Badge>;
    if (status === "CHANNEL_ERROR")
      return <Badge variant="destructive">Error</Badge>;
    return <Badge variant="outline">Connecting...</Badge>;
  };

  return (
    <Card className="border-2 border-dashed border-orange-300 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Real-time Diagnostic Tool
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          This component checks if Supabase Realtime is working properly.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bookings Status */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon(bookingsStatus)}
            <div>
              <p className="font-semibold">Bookings Table</p>
              <p className="text-sm text-muted-foreground">
                Status: {bookingsStatus}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last event: {lastBookingEvent}
              </p>
            </div>
          </div>
          {getStatusBadge(bookingsStatus)}
        </div>

        {/* Notifications Status */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon(notificationsStatus)}
            <div>
              <p className="font-semibold">Admin Notifications Table</p>
              <p className="text-sm text-muted-foreground">
                Status: {notificationsStatus}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last event: {lastNotificationEvent}
              </p>
            </div>
          </div>
          {getStatusBadge(notificationsStatus)}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold mb-2">Testing Instructions:</p>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Keep this page open</li>
            <li>Open another browser/incognito tab</li>
            <li>Create a new booking</li>
            <li>Watch the &quot;Last event&quot; times update here</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        {(bookingsStatus === "CLOSED" || notificationsStatus === "CLOSED") && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-red-900 mb-2">
              ⚠️ Connection Issue Detected
            </p>
            <p className="text-sm text-red-700 mb-2">Possible causes:</p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Supabase Realtime not enabled in project settings</li>
              <li>Tables not added to replication publication</li>
              <li>Network/firewall blocking WebSocket connections</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealtimeDiagnostic;

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Wifi, WifiOff } from "lucide-react";

const TimeSlotsRealtimeDiagnostic = ({
  isSubscribed,
  courtId,
  date,
}: {
  isSubscribed: boolean;
  courtId: string;
  date: string;
}) => {
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    if (isSubscribed) {
      setLastEventTime(new Date());
      setEventCount((prev) => prev + 1);
    }
  }, [isSubscribed]);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {isSubscribed ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              Real-time Status
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-400" />
              Real-time Status
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Time Slots Subscription:
          </span>
          {isSubscribed ? (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Inactive
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Court ID:</span>
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
            {courtId || "None"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Date:</span>
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
            {date || "None"}
          </span>
        </div>

        {lastEventTime && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Last Connection:
              </span>
              <span className="text-xs">
                {lastEventTime.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Connection Count:
              </span>
              <span className="text-xs font-semibold">{eventCount}</span>
            </div>
          </>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Try changing a slot in Supabase to see real-time updates
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSlotsRealtimeDiagnostic;

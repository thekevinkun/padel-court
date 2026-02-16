"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock, Edit2, Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// import TimeSlotsRealtimeDiagnostic from "@/components/dashboard/TimeSlotsRealtimeDiagnostic";

import { TimeSlot } from "@/types";
import { useRealtimeTimeSlots } from "@/hooks/useRealtimeTimeSlots";
import { supabase } from "@/lib/supabase/client";

const TimeSlotsPageClient = () => {
  const [courts, setCourts] = useState<{ id: string; name: string }[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA").split("T")[0],
  );

  // Use real-time hook
  const { timeSlots, loading, refetch } = useRealtimeTimeSlots({
    courtId: selectedCourt,
    date: selectedDate,
    enabled: !!selectedCourt && !!selectedDate,
  });

  // Edit dialog state
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editAvailable, setEditAvailable] = useState(true);

  // Generate dialog state
  const [generating, setGenerating] = useState(false);
  const [generateDays, setGenerateDays] = useState(30);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // Bulk action loading states
  const [blockingAll, setBlockingAll] = useState(false);
  const [unblockingAll, setUnblockingAll] = useState(false);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from("courts")
        .select("id, name")
        .eq("available", true)
        .order("name");

      if (error) throw error;

      if (data && data.length > 0) {
        setCourts(data);
        setSelectedCourt(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching courts:", error);
      toast.error("Failed to load courts");
    } finally {
      setLoadingCourts(false);
    }
  };

  const toggleSlotAvailability = async (slot: TimeSlot) => {
    // Check if slot is booked
    if (slot.is_booked) {
      toast.error("Cannot modify this slot", {
        description: "This slot has active bookings. Cancel the booking first.",
      });
      return;
    }

    try {
      // Toggle admin_blocked status
      const newBlockedStatus = !slot.admin_blocked;

      const { error } = await supabase
        .from("time_slots")
        .update({
          admin_blocked: newBlockedStatus,
          available: !newBlockedStatus, // ALSO update available field for now
        })
        .eq("id", slot.id);

      if (error) throw error;

      console.log(
        `✅ Toggled slot ${slot.id} admin_blocked to ${newBlockedStatus}`,
      );
    } catch (error) {
      console.error("Error toggling slot:", error);
      toast.error("Failed to update slot");
    }
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setEditPrice(slot.price_per_person);
    setEditAvailable(slot.available);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSlot) return;

    setSaving(true);
    try {
      // Check if we're trying to unblock a booked slot
      if (!editAvailable && editingSlot.is_booked) {
        const { canAdminModifySlot } = await import("@/lib/time-slot");
        const { canModify, reason } = await canAdminModifySlot(editingSlot.id);

        if (!canModify) {
          toast.error("Cannot modify availability", {
            description: reason || "This slot has active bookings",
          });
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from("time_slots")
        .update({
          price_per_person: editPrice,
          admin_blocked: !editAvailable, // Store as admin_blocked, not available
        })
        .eq("id", editingSlot.id);

      if (error) throw error;
      console.log("✅ Successfully saved edit");
      setEditDialogOpen(false);
      setEditingSlot(null);
    } catch (error) {
      console.error("Error saving slot:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const blockAllSlotsForDate = async () => {
    if (!confirm(`Block all available slots for ${selectedDate}?`)) return;

    setBlockingAll(true);
    try {
      // Get slots that can be blocked (not already booked)
      const slotsToBlock = timeSlots.filter(
        (slot) => !slot.admin_blocked && !slot.is_booked,
      );

      if (slotsToBlock.length === 0) {
        toast.info("No slots available to block");
        setBlockingAll(false);
        return;
      }

      const slotIds = slotsToBlock.map((s) => s.id);

      const { data, error } = await supabase
        .from("time_slots")
        .update({ admin_blocked: true })
        .in("id", slotIds)
        .select();

      if (error) throw error;

      const count = data?.length || 0;
      const skippedBooked = timeSlots.filter((s) => s.is_booked).length;

      if (count > 0) {
        toast.success(`Blocked ${count} slot${count > 1 ? "s" : ""}`, {
          description:
            skippedBooked > 0
              ? `Skipped ${skippedBooked} booked slot${skippedBooked > 1 ? "s" : ""}`
              : undefined,
        });
      }
    } catch (error) {
      console.error("Error blocking slots:", error);
      toast.error("Failed to block slots");
    } finally {
      setBlockingAll(false);
    }
  };

  const unblockAllSlotsForDate = async () => {
    if (!confirm(`Unblock all admin-blocked slots for ${selectedDate}?`))
      return;

    setUnblockingAll(true);
    try {
      // Only unblock slots that are admin-blocked (not booked)
      const slotsToUnblock = timeSlots.filter(
        (slot) => slot.admin_blocked && !slot.is_booked,
      );

      if (slotsToUnblock.length === 0) {
        toast.info("No admin-blocked slots to unblock");
        setUnblockingAll(false);
        return;
      }

      const slotIds = slotsToUnblock.map((s) => s.id);

      const { data, error } = await supabase
        .from("time_slots")
        .update({ admin_blocked: false })
        .in("id", slotIds)
        .select();

      if (error) throw error;

      const count = data?.length || 0;
      if (count > 0) {
        toast.success(`Unblocked ${count} slot${count > 1 ? "s" : ""}`);
      }
    } catch (error) {
      console.error("Error unblocking slots:", error);
      toast.error("Failed to unblock slots");
    } finally {
      setUnblockingAll(false);
    }
  };

  const handleGenerateSlots = async () => {
    if (!confirm(`Generate time slots for the next ${generateDays} days?`)) {
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/time-slots/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: generateDays,
          startDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate time slots");
      }

      const data = await response.json();

      toast.success("Time slots generated successfully", {
        description: `Generated: ${data.generated} slots | Skipped: ${data.skipped} existing`,
      });

      await refetch();
      setGenerateDialogOpen(false);
    } catch (error) {
      console.error("Error generating slots:", error);
      toast.error("Failed to generate time slots");
    } finally {
      setGenerating(false);
    }
  };

  if (loadingCourts || courts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  const bookedCount = timeSlots.filter((s) => s.is_booked).length;
  const adminBlockedCount = timeSlots.filter(
    (s) => s.admin_blocked && !s.is_booked,
  ).length;
  const availableCount = timeSlots.filter((s) => s.available).length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row flex-wrap gap-4">
            {/* Court Selection */}
            <div className="flex-1">
              <Label htmlFor="court">Court</Label>
              <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                <SelectTrigger id="court" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="flex-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Generate Slots Button */}
            <div className="flex items-end gap-2">
              <Button
                variant="default"
                onClick={() => setGenerateDialogOpen(true)}
                className="w-full lg:w-auto bg-forest"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Generate Slots
              </Button>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={blockAllSlotsForDate}
                disabled={blockingAll || timeSlots.length === 0}
                className="w-full lg:w-auto"
              >
                {blockingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Blocking...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Block All
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={unblockAllSlotsForDate}
                disabled={unblockingAll || timeSlots.length === 0}
                className="w-full lg:w-auto"
              >
                {unblockingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unblocking...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unblock All
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Real-time Connection Indicator */}
          {/* {isSubscribed && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <Wifi className="w-4 h-4" />
              <span>Live updates active</span>
            </div>
          )} */}

          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-forest">
                {timeSlots.length}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {availableCount}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {bookedCount}
              </div>
              <div className="text-xs text-muted-foreground">Booked</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">
                {adminBlockedCount}
              </div>
              <div className="text-xs text-muted-foreground">Admin Blocked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-forest" />
          </div>
        ) : timeSlots.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No time slots for this date
          </p>
        ) : (
          timeSlots.map((slot) => (
            <Card
              key={slot.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                slot.available ? "border-green-200" : "border-red-200"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold">
                    {slot.time_start.substring(0, 5)} -{" "}
                    {slot.time_end.substring(0, 5)}
                  </div>
                  {slot.is_booked ? (
                    <Badge className="bg-blue-100 text-blue-800">Booked</Badge>
                  ) : slot.admin_blocked ? (
                    <Badge className="bg-red-100 text-red-800">
                      Admin Blocked
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">
                      Available
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium capitalize">
                      {slot.period}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price/pax:</span>
                    <span className="font-medium">
                      IDR {slot.price_per_person.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditSlot(slot)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant={slot.admin_blocked ? "default" : "destructive"}
                    className="flex-1"
                    onClick={() => toggleSlotAvailability(slot)}
                    disabled={slot.is_booked}
                    title={
                      slot.is_booked ? "Cannot modify - has active booking" : ""
                    }
                  >
                    {slot.is_booked ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Booked
                      </>
                    ) : slot.admin_blocked ? (
                      <>
                        <Unlock className="w-3 h-3 mr-1" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Block
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Edit Time Slot</DialogTitle>
            <DialogDescription className="sr-only">
              Find the right time for time slots
            </DialogDescription>
          </DialogHeader>
          {editingSlot && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-lg font-semibold">
                  {editingSlot.time_start.substring(0, 5)} -{" "}
                  {editingSlot.time_end.substring(0, 5)}
                </p>
              </div>

              <div>
                <Label htmlFor="price">Price per Person (IDR)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editAvailable}
                    onChange={(e) => setEditAvailable(e.target.checked)}
                    disabled={editingSlot?.is_booked}
                    className="cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Label
                    htmlFor="available"
                    className={
                      editingSlot?.is_booked
                        ? "cursor-not-allowed text-muted-foreground"
                        : "cursor-pointer"
                    }
                  >
                    Available for booking
                  </Label>
                </div>
                {editingSlot?.is_booked && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    ℹ️ This slot has {editingSlot.booking_count} active
                    booking(s). Availability cannot be changed until bookings
                    are cancelled.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-forest"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Slots Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Generate Time Slots</DialogTitle>
            <DialogDescription className="sr-only">
              Fill new time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ How it works:</strong>
              </p>
              <p className="mt-2 text-sm text-blue-800">
                This will automatically create time slots for all available
                courts for the next X days. Existing slots will be skipped.
              </p>
            </div>

            <div>
              <Label htmlFor="generateDays">Number of Days</Label>
              <Input
                id="generateDays"
                type="number"
                min="1"
                max="90"
                value={generateDays}
                onChange={(e) =>
                  setGenerateDays(parseInt(e.target.value) || 30)
                }
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 30 days. Maximum: 90 days.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <h4 className="font-semibold text-sm mb-2">
                Time Slot Schedule:
              </h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Morning Peak: 06:00 - 10:00 (IDR 100,000/pax)</li>
                <li>• Off-Peak: 10:00 - 15:00 (IDR 60,000/pax)</li>
                <li>• Evening Peak: 15:00 - 22:00 (IDR 100,000/pax)</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setGenerateDialogOpen(false)}
                disabled={generating}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-forest"
                onClick={handleGenerateSlots}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Real-time Diagnostics */}
      {/* <TimeSlotsRealtimeDiagnostic 
        isSubscribed={isSubscribed}
        courtId={selectedCourt}
        date={selectedDate}
      /> */}
    </div>
  );
};

export default TimeSlotsPageClient;

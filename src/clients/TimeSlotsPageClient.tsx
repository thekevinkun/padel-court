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
    new Date().toLocaleDateString("en-CA").split("T")[0]
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
    try {
      const newAvailability = !slot.available;

      const { error } = await supabase
        .from("time_slots")
        .update({ available: newAvailability })
        .eq("id", slot.id);

      if (error) throw error;

      // Don't show toast here - real-time hook will handle it
      console.log(
        `✅ Toggled slot ${slot.id} availability to ${newAvailability}`
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
      const { error } = await supabase
        .from("time_slots")
        .update({
          price_per_person: editPrice,
          available: editAvailable,
        })
        .eq("id", editingSlot.id);

      if (error) throw error;

      // Don't show toast here - real-time hook will handle it
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
    if (!confirm(`Block all slots for ${selectedDate}?`)) return;

    setBlockingAll(true);
    try {
      const { data, error } = await supabase
        .from("time_slots")
        .update({ available: false })
        .eq("court_id", selectedCourt)
        .eq("date", selectedDate)
        .eq("available", true)
        .select();

      if (error) throw error;

      // Show summary toast (real-time hook will show individual toasts)
      const count = data?.length || 0;
      if (count > 0) {
        toast.success(`Blocked ${count} slot${count > 1 ? "s" : ""}`);
      }
    } catch (error) {
      console.error("Error blocking slots:", error);
      toast.error("Failed to block slots");
    } finally {
      setBlockingAll(false);
    }
  };

  const unblockAllSlotsForDate = async () => {
    if (!confirm(`Unblock all slots for ${selectedDate}?`)) return;

    setUnblockingAll(true);
    try {
      const { data, error } = await supabase
        .from("time_slots")
        .update({ available: true })
        .eq("court_id", selectedCourt)
        .eq("date", selectedDate)
        .eq("available", false)
        .select();

      if (error) throw error;

      // Show summary toast (real-time hook will show individual toasts)
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

  const bookedCount = timeSlots.filter((s) => !s.available).length;
  const availableCount = timeSlots.filter((s) => s.available).length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
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
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-forest">
                {timeSlots.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Slots</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {availableCount}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">
                {bookedCount}
              </div>
              <div className="text-xs text-muted-foreground">Blocked</div>
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
                  {slot.available ? (
                    <Badge className="bg-green-100 text-green-800">
                      Available
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Blocked</Badge>
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

                <div className="flex gap-2">
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
                    variant={slot.available ? "destructive" : "default"}
                    className="flex-1"
                    onClick={() => toggleSlotAvailability(slot)}
                  >
                    {slot.available ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Block
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 mr-1" />
                        Unblock
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
        <DialogContent className="max-w-md">
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

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={editAvailable}
                  onChange={(e) => setEditAvailable(e.target.checked)}
                  className="cursor-pointer"
                />
                <Label htmlFor="available" className="cursor-pointer">
                  Available for booking
                </Label>
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
        <DialogContent className="max-w-md">
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

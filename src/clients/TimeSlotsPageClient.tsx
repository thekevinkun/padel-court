"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock, Edit2, Loader2 } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { TimeSlot } from "@/types";
import { supabase } from "@/lib/supabase/client";

const TimeSlotsPageClient = () => {
  const [courts, setCourts] = useState<{ id: string; name: string }[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editAvailable, setEditAvailable] = useState(true);

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    if (selectedCourt) {
      fetchTimeSlots();
    }
  }, [selectedCourt, selectedDate]);

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from("courts")
        .select("id, name")
        .eq("available", true)
        .order("name");

      if (!error && data) {
        setCourts(data);
        if (data.length > 0) {
          setSelectedCourt(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching courts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("court_id", selectedCourt)
        .eq("date", selectedDate)
        .order("time_start");

      if (!error && data) {
        setTimeSlots(data);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const toggleSlotAvailability = async (slot: TimeSlot) => {
    try {
      const { error } = await supabase
        .from("time_slots")
        .update({ available: !slot.available })
        .eq("id", slot.id);

      if (error) throw error;

      await fetchTimeSlots();
    } catch (error) {
      console.error("Error updating slot:", error);
      alert("Error updating slot");
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

      await fetchTimeSlots();
      setEditDialogOpen(false);
      setEditingSlot(null);
    } catch (error) {
      console.error("Error saving slot:", error);
      alert("Error saving slot");
    } finally {
      setSaving(false);
    }
  };

  const blockAllSlotsForDate = async () => {
    if (!confirm("Block all slots for this date?")) return;

    try {
      const { error } = await supabase
        .from("time_slots")
        .update({ available: false })
        .eq("court_id", selectedCourt)
        .eq("date", selectedDate);

      if (error) throw error;

      await fetchTimeSlots();
    } catch (error) {
      console.error("Error blocking slots:", error);
      alert("Error blocking slots");
    }
  };

  const unblockAllSlotsForDate = async () => {
    if (!confirm("Unblock all slots for this date?")) return;

    try {
      const { error } = await supabase
        .from("time_slots")
        .update({ available: true })
        .eq("court_id", selectedCourt)
        .eq("date", selectedDate);

      if (error) throw error;

      await fetchTimeSlots();
    } catch (error) {
      console.error("Error unblocking slots:", error);
      alert("Error unblocking slots");
    }
  };

  if (loading || courts.length === 0) {
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

            {/* Bulk Actions */}
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={blockAllSlotsForDate}
                className="w-full lg:w-auto"
              >
                <Lock className="w-4 h-4 mr-2" />
                Block All
              </Button>
              <Button
                variant="outline"
                onClick={unblockAllSlotsForDate}
                className="w-full lg:w-auto"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Unblock All
              </Button>
            </div>
          </div>

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
        {timeSlots.length === 0 ? (
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
                  className="flex-1"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeSlotsPageClient;

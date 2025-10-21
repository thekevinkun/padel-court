"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import { BookingFormData } from "@/types";
import { supabase } from "@/lib/supabase/client";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, name: "Court & Time", icon: Calendar },
  { id: 2, name: "Your Info", icon: Users },
  { id: 3, name: "Confirm Payment", icon: CreditCard },
];

const BookingDialog = ({
  open,
  onOpenChange,
}: BookingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    date: new Date(),
    numberOfPlayers: 4,
  });

  // Fetch courts and time slots from database
  const [courts, setCourts] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch courts on mount
  useEffect(() => {
    fetchCourts();
  }, []);

  // Fetch time slots when court or date changes
  useEffect(() => {
    if (formData.courtId && formData.date) {
      fetchTimeSlots();
    }
  }, [formData.courtId, formData.date]);

  const fetchCourts = async () => {
    const { data, error } = await supabase
      .from("courts")
      .select("*")
      .eq("available", true)
      .order("name");

    if (!error && data) {
      setCourts(data);
    }
  };

  const fetchTimeSlots = async () => {
    if (!formData.courtId || !formData.date) return;

    setLoadingSlots(true);
    const dateStr = formData.date.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("court_id", formData.courtId)
      .eq("date", dateStr)
      .eq("available", true)
      .order("time_start");

    if (!error && data) {
      // Format time slots to match your existing format
      const formatted = data.map((slot) => ({
        id: slot.id,
        time: `${slot.time_start.substring(0, 5)} - ${slot.time_end.substring(0, 5)}`,
        available: slot.available,
        period: slot.period,
        pricePerPerson: slot.price_per_person,
      }));
      setTimeSlots(formatted);
    }
    setLoadingSlots(false);
  };

  const selectedCourt = courts.find((c) => c.id === formData.courtId);
  const selectedSlot = timeSlots.find((s) => s.id === formData.slotId);

  const calculateTotal = () => {
    if (!selectedSlot || !formData.numberOfPlayers) return 0;
    const subtotal = selectedSlot.pricePerPerson * formData.numberOfPlayers;

    return subtotal;
  };

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      // Create booking in database
      const bookingResponse = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: formData.courtId,
          timeSlotId: formData.slotId,
          date: formData.date?.toISOString().split("T")[0],
          time: selectedSlot!.time,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerWhatsapp: formData.whatsapp,
          numberOfPlayers: formData.numberOfPlayers,
          subtotal: selectedSlot!.pricePerPerson * formData.numberOfPlayers!,
          paymentFee: 0,
          totalAmount: calculateTotal(),
          paymentMethod: null,
          notes: formData.notes,
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error("Failed to create booking");
      }

      const { booking } = await bookingResponse.json();

      // Create payment with Midtrans
      const paymentResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment");
      }

      const { paymentUrl } = await paymentResponse.json();

      // Redirect to Midtrans payment page
      window.location.href = paymentUrl;

    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred during booking. Please try again.");
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setFormData({ date: new Date(), numberOfPlayers: 4 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            Book Your Court
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep >= step.id
                      ? "border-forest bg-forest text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2 font-medium hidden sm:block">
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    currentStep > step.id ? "bg-forest" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Court & Time Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Date Selection */}
              <div>
                <Label>Select Date</Label>
                <Input
                  type="date"
                  value={formData.date?.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, date: new Date(e.target.value) })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-2"
                />
              </div>

              {/* Court Selection */}
              <div>
                <Label>Choose Your Court</Label>
                <RadioGroup
                  value={formData.courtId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, courtId: value })
                  }
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                >
                  {courts.map((court) => (
                    <Card
                      key={court.id}
                      className={`cursor-pointer transition-all ${
                        formData.courtId === court.id
                          ? "border-forest ring-2 ring-forest/20"
                          : court.available
                          ? "hover:border-forest/50"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem
                            value={court.id}
                            disabled={!court.available}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              {court.name}
                              {!court.available && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Booked
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {court.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </div>

              {/* Time Slot Selection */}
              <div>
                <Label>Select Time Slot</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-forest" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading available slots...
                    </span>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {formData.courtId
                      ? "No available slots for this date"
                      : "Please select a court first"}
                  </div>
                ) : (
                  <RadioGroup
                    value={formData.slotId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, slotId: value })
                    }
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2"
                  >
                    {timeSlots.map((slot) => (
                      <Card
                        key={slot.id}
                        className={`cursor-pointer transition-all ${
                          formData.slotId === slot.id
                            ? "border-forest ring-2 ring-forest/20"
                            : "hover:border-forest/50"
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex flex-col items-center text-center gap-2">
                            <RadioGroupItem value={slot.id} />
                            <div className="text-sm font-medium">{slot.time}</div>
                            <Badge
                              variant={
                                slot.period === "peak" ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {slot.period === "peak" ? "Peak" : "Off-Peak"}
                            </Badge>
                            <div className="text-xs font-bold text-forest">
                              {slot.pricePerPerson.toLocaleString("id-ID")}/pax
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Number of Players */}
              <div>
                <Label>Number of Players</Label>
                <Select
                  value={formData.numberOfPlayers?.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      numberOfPlayers: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Player" : "Players"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.courtId || !formData.slotId}
                  size="lg"
                  className="rounded-full hover:text-accent-foreground"
                >
                  Next
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+62 812 3456 7890"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    placeholder="+62 812 3456 7890"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any special requests..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                >
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={
                    !formData.name ||
                    !formData.email ||
                    !formData.phone ||
                    !formData.whatsapp
                  }
                  size="lg"
                  className="rounded-full hover:text-accent-foreground"
                >
                  Next
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Booking Summary */}
              <Card className="bg-muted/30">
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-semibold mb-4">Booking Summary</h4>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Court:</span>
                    <span className="font-medium">{selectedCourt?.name}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {formData.date?.toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{selectedSlot?.time}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Players:</span>
                    <span className="font-medium">
                      {formData.numberOfPlayers}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>
                      IDR{" "}
                      {(
                        selectedSlot!.pricePerPerson * formData.numberOfPlayers!
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-forest">
                      IDR {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeTerms: checked as boolean })
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  I agree to the terms and conditions. Payment will be processed securely by Midtrans.
                </label>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                  disabled={isProcessing}
                >
                  <ArrowLeft className="mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !formData.agreeTerms ||
                    isProcessing
                  }
                  size="lg"
                  className="rounded-full hover:text-accent-foreground"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default BookingDialog;
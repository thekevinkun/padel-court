"use client";

import { useState, useEffect } from "react";
import { differenceInHours, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  Info,
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
  DialogDescription,
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

import { useSettings } from "@/hooks/useSettings";
import { BookingFormData } from "@/types/booking";
import { supabase } from "@/lib/supabase/client";
import { Court } from "@/types";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, name: "Court & Time", icon: Calendar },
  { id: 2, name: "Your Info", icon: Users },
  { id: 3, name: "Confirm Payment", icon: CreditCard },
];

const BookingDialog = ({ open, onOpenChange }: BookingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    date: new Date(),
    numberOfPlayers: 4,
  });

  // Fetch settings
  const { settings } = useSettings();

  // Fetch courts and time slots from database
  const [courts, setCourts] = useState<Court[]>([]);
  const [timeSlots, setTimeSlots] = useState<
    Array<{
      id: string;
      time: string;
      available: boolean;
      period: string;
      pricePerPerson: number;
    }>
  >([]);
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
    const dateStr = formData.date.toLocaleDateString("en-CA");

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
        time: `${slot.time_start.substring(0, 5)} - ${slot.time_end.substring(
          0,
          5,
        )}`,
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
      const deposit = calculateDeposit();
      const total = calculateTotal();

      // Determine payment choice
      const paymentChoice =
        formData.paymentChoice ||
        (settings?.require_deposit ? "DEPOSIT" : "FULL");

      // Calculate amount to pay based on choice
      let amountToPay: number;
      let requireDeposit: boolean;
      let depositAmount: number;

      if (paymentChoice === "FULL") {
        // Customer chose full payment
        amountToPay = total;
        requireDeposit = false;
        depositAmount = 0;
      } else {
        // Customer chose deposit payment
        amountToPay = deposit;
        requireDeposit = true;
        depositAmount = deposit;
      }

      // Create booking in database
      const bookingResponse = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: formData.courtId,
          timeSlotId: formData.slotId,
          date: formData.date?.toLocaleDateString("en-CA"),
          time: selectedSlot!.time,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerWhatsapp: formData.whatsapp,
          numberOfPlayers: formData.numberOfPlayers,
          subtotal: selectedSlot!.pricePerPerson * formData.numberOfPlayers!,
          paymentFee: 0,
          totalAmount: amountToPay,
          paymentMethod: null,
          notes: formData.notes,
          requireDeposit: requireDeposit,
          depositAmount: depositAmount,
          fullAmount: total,
          paymentChoice: paymentChoice,
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
    } catch (error: unknown) {
      console.error("Booking error:", error);

      // IMPROVED ERROR HANDLING
      const err = error as {
        message?: string;
        code?: string;
        retryAfter?: number;
      };

      if (
        err.code === "RATE_LIMIT_EXCEEDED" ||
        err.code === "EMAIL_RATE_LIMIT_EXCEEDED"
      ) {
        alert(
          `⏱️ Rate Limit Exceeded\n\n${
            err.message || "Too many attempts. Please try again later."
          }\n\nThis is a security measure to prevent spam.`,
        );
      } else {
        alert("An error occurred during booking. Please try again.");
      }

      setIsProcessing(false);
    }
  };

  // Helper to check if time slot has already passed
  const isTimeSlotPassed = (
    slot: { time: string },
    bookingDate: Date,
  ): boolean => {
    const now = new Date();
    const slotDateTime = new Date(bookingDate);

    // Parse slot time (e.g., "14:00 - 15:00")
    const timeStart = slot.time.split(" - ")[0];
    const [hours, minutes] = timeStart.split(":").map(Number);

    slotDateTime.setHours(hours, minutes, 0, 0);

    // Slot has passed if it's in the past
    return slotDateTime < now;
  };

  // Helper function to check if time slot is allowed (too soon)
  const isTimeSlotTooSoon = (
    slot: { time: string },
    bookingDate: Date,
  ): boolean => {
    if (!settings) return false;

    const now = new Date();
    const slotDateTime = new Date(bookingDate);

    // Parse slot time
    const timeStart = slot.time.split(" - ")[0];
    const [hours, minutes] = timeStart.split(":").map(Number);

    slotDateTime.setHours(hours, minutes, 0, 0);

    // Check if slot is at least min_advance_booking hours away
    const hoursDiff = differenceInHours(slotDateTime, now);

    // Slot is too soon if it's in the future but within min advance window
    return hoursDiff >= 0 && hoursDiff < settings.min_advance_booking;
  };

  // // Combined check for allowed slots
  // const isTimeSlotAllowed = (slot: any, bookingDate: Date): boolean => {
  //   // Slot is NOT allowed if it has passed OR is too soon
  //   return (
  //     !isTimeSlotPassed(slot, bookingDate) &&
  //     !isTimeSlotTooSoon(slot, bookingDate)
  //   );
  // };

  // Calculate deposit if required
  const calculateDeposit = (): number => {
    if (!settings || !selectedSlot || !formData.numberOfPlayers) return 0;

    if (!settings.require_deposit) return 0;

    const subtotal = selectedSlot.pricePerPerson * formData.numberOfPlayers;
    return Math.round(subtotal * (settings.deposit_percentage / 100));
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setFormData({ date: new Date(), numberOfPlayers: 4 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        className="max-w-4xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0"
      >
        <div
          className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent 
              [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full 
              [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent"
          tabIndex={-1}
          style={{ outline: "none" }}
        >
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-display">
                Book Your Court
              </DialogTitle>
              <DialogDescription>
                Select a court, choose your time, and fill in your details to
                book.
              </DialogDescription>
            </DialogHeader>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
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
                      className={`h-0.5 w-6 sm:w-12 mx-3 transition-all ${
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
                    {settings && (
                      <p className="text-xs text-muted-foreground mt-1 mb-2">
                        You can book up to {settings.max_advance_booking} days
                        in advance
                      </p>
                    )}
                    <Input
                      type="date"
                      value={formData.date?.toLocaleDateString("en-CA")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date: new Date(e.target.value),
                        })
                      }
                      min={new Date().toLocaleDateString("en-CA")}
                      max={
                        settings
                          ? addDays(
                              new Date(),
                              settings.max_advance_booking,
                            ).toLocaleDateString("en-CA")
                          : undefined
                      }
                      autoFocus={false}
                      className="mt-2 w-full appearance-none max-w-full"
                    />
                  </div>

                  {/* Court Selection */}
                  <div>
                    <Label>Choose Your Court</Label>
                    <RadioGroup
                      value={formData.courtId || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, courtId: value })
                      }
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                    >
                      {courts.map((court) => (
                        <Card
                          key={court.id}
                          onClick={() => {
                            if (court.available) {
                              setFormData({ ...formData, courtId: court.id });
                            }
                          }}
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
                    {(settings && settings.min_advance_booking > 0) && (
                      <p className="text-xs text-muted-foreground mt-1 mb-2">
                        Slots must be booked at least{" "}
                        {settings.min_advance_booking} hours in advance
                      </p>
                    )}

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
                        value={formData.slotId || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, slotId: value })
                        }
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2"
                      >
                        {timeSlots.map((slot) => {
                          const hasPassed = formData.date
                            ? isTimeSlotPassed(slot, formData.date)
                            : false;
                          const isTooSoon = formData.date
                            ? isTimeSlotTooSoon(slot, formData.date)
                            : false;
                          const isAllowed = !hasPassed && !isTooSoon;

                          return (
                            <Card
                              key={slot.id}
                              onClick={() => {
                                if (isAllowed) {
                                  setFormData({ ...formData, slotId: slot.id });
                                }
                              }}
                              className={`cursor-pointer transition-all ${
                                formData.slotId === slot.id
                                  ? "border-forest ring-2 ring-forest/20"
                                  : isAllowed
                                    ? "hover:border-forest/50"
                                    : "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <CardContent className="p-3">
                                <div className="flex flex-col items-center text-center gap-2">
                                  <RadioGroupItem
                                    value={slot.id}
                                    disabled={!isAllowed}
                                  />
                                  <div className="text-sm font-medium">
                                    {slot.time}
                                  </div>
                                  <Badge
                                    variant={
                                      slot.period === "peak"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {slot.period === "peak"
                                      ? "Peak"
                                      : "Off-Peak"}
                                  </Badge>
                                  <div className="text-xs font-bold text-forest">
                                    {slot.pricePerPerson.toLocaleString(
                                      "id-ID",
                                    )}
                                    /pax
                                  </div>

                                  {/* Show appropriate message */}
                                  {hasPassed && (
                                    <div className="text-xs text-gray-400 font-medium">
                                      Passed
                                    </div>
                                  )}
                                  {isTooSoon && !hasPassed && (
                                    <div className="text-xs text-red-500 font-medium">
                                      Too soon
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
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

              {/* Step 3: Payment Confirmation - UPDATED */}
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
                        <span className="font-medium">
                          {selectedCourt?.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {formData.date?.toLocaleDateString("en-CA")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {selectedSlot?.time}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Players:</span>
                        <span className="font-medium">
                          {formData.numberOfPlayers}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-sm">
                        <span>Court Booking:</span>
                        <span>
                          IDR {calculateTotal().toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Payment Choice Section */}
                      {settings?.require_deposit ? (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <Label className="text-base font-semibold">
                              Choose Payment Option
                            </Label>
                            <RadioGroup
                              value={formData.paymentChoice || "DEPOSIT"}
                              onValueChange={(value: "DEPOSIT" | "FULL") =>
                                setFormData({
                                  ...formData,
                                  paymentChoice: value,
                                })
                              }
                              className="space-y-3"
                            >
                              {/* Deposit Option */}
                              <Card
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    paymentChoice: "DEPOSIT",
                                  })
                                }
                                className={`cursor-pointer transition-all ${
                                  formData.paymentChoice === "DEPOSIT" ||
                                  !formData.paymentChoice
                                    ? "border-forest ring-2 ring-forest/20"
                                    : "hover:border-forest/50"
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <RadioGroupItem
                                      value="DEPOSIT"
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">
                                          Pay {settings.deposit_percentage}%
                                          Deposit
                                        </h4>
                                        <Badge className="bg-blue-100 text-blue-800">
                                          Recommended
                                        </Badge>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            Pay Now:
                                          </span>
                                          <span className="font-bold text-blue-600">
                                            IDR{" "}
                                            {calculateDeposit().toLocaleString(
                                              "id-ID",
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            Pay at Venue:
                                          </span>
                                          <span className="font-medium text-orange-600">
                                            IDR{" "}
                                            {(
                                              calculateTotal() -
                                              calculateDeposit()
                                            ).toLocaleString("id-ID")}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        ✓ Secure your booking now, pay the rest
                                        when you arrive
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Full Payment Option */}
                              <Card
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    paymentChoice: "FULL",
                                  })
                                }
                                className={`cursor-pointer transition-all ${
                                  formData.paymentChoice === "FULL"
                                    ? "border-forest ring-2 ring-forest/20"
                                    : "hover:border-forest/50"
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <RadioGroupItem
                                      value="FULL"
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">
                                          Pay 100% Now
                                        </h4>
                                        <Badge variant="outline">
                                          Full Payment
                                        </Badge>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            Pay Now:
                                          </span>
                                          <span className="font-bold text-green-600">
                                            IDR{" "}
                                            {calculateTotal().toLocaleString(
                                              "id-ID",
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            Pay at Venue:
                                          </span>
                                          <span className="font-medium text-gray-500">
                                            IDR 0
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        ✓ Pay everything upfront, no payment
                                        needed at venue
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </RadioGroup>
                          </div>

                          <Separator />

                          {/* Display chosen amount */}
                          <div className="bg-gradient-to-r from-forest/10 to-forest/5 p-4 rounded-lg">
                            <div className="flex justify-between items-center gap-2">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {formData.paymentChoice === "FULL"
                                    ? "Total Payment"
                                    : `Deposit (${settings.deposit_percentage}%)`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Payment will be processed on next page
                                </p>
                              </div>
                              <span className="text-2xl font-bold text-forest">
                                IDR{" "}
                                {formData.paymentChoice === "FULL"
                                  ? calculateTotal().toLocaleString("id-ID")
                                  : calculateDeposit().toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* No deposit option - Full payment only */}
                          <Separator />
                          <div className="bg-gradient-to-r from-forest/10 to-forest/5 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Total Payment
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Payment will be processed on next page
                                </p>
                              </div>
                              <span className="text-2xl font-bold text-forest">
                                IDR {calculateTotal().toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cancellation Policy */}
                  {settings && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-sm text-yellow-800">
                        <strong>Cancellation Policy:</strong> Free cancellation
                        up to {settings.cancellation_window} hours before your
                        booking. After that,
                        {formData.paymentChoice === "FULL" ||
                        !settings.require_deposit
                          ? " payment is"
                          : " deposit is"}{" "}
                        non-refundable.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          agreeTerms: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-forest underline"
                        target="_blank"
                      >
                        terms and conditions
                      </a>
                      . Payment will be processed securely by{" "}
                      <strong className="text-forest">Midtrans</strong>.
                      {settings && settings.cancellation_window > 0 && (
                        <>
                          {" "}
                          I understand the {settings.cancellation_window}-hour
                          cancellation policy.
                        </>
                      )}
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between gap-1 sm:gap-3 pt-4">
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
                      disabled={!formData.agreeTerms || isProcessing}
                      size="lg"
                      className="rounded-full hover:text-accent-foreground"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Payment
                          <ArrowRight className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;

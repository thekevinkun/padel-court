"use client";

import { useState, useEffect } from "react";
import { differenceInHours, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Info,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { Court } from "@/types";
import { BookingFormData } from "@/types/booking";
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

const BookingDialog = ({ open, onOpenChange }: BookingDialogProps) => {
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Updated form data with slotIds array
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    date: new Date(),
    numberOfPlayers: 4,
    slotIds: [], // Multiple slot selection
  });

  // Equipment rental state
  const [availableEquipment, setAvailableEquipment] = useState<
    Array<{
      id: string;
      name: string;
      category: string;
      price_per_session: number;
      description: string | null;
    }>
  >([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [equipmentQuantities, setEquipmentQuantities] = useState<
    Record<string, number>
  >({});

  // Additional players state
  const [additionalPlayers, setAdditionalPlayers] = useState<
    Array<{
      name: string;
      email: string;
      whatsapp: string;
    }>
  >([
    { name: "", email: "", whatsapp: "" },
    { name: "", email: "", whatsapp: "" },
    { name: "", email: "", whatsapp: "" },
  ]);

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

  useEffect(() => {
    fetchCourts();
    fetchEquipment();
  }, []);

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

  // Fetch available equipment
  const fetchEquipment = async () => {
    setLoadingEquipment(true);
    try {
      const response = await fetch("/api/equipment/available");
      const data = await response.json();

      if (data.success && data.equipment) {
        setAvailableEquipment(data.equipment);

        // Initialize quantities to 0
        const initialQuantities: Record<string, number> = {};
        data.equipment.forEach((item: { id: string }) => {
          initialQuantities[item.id] = 0;
        });
        setEquipmentQuantities(initialQuantities);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Failed to load equipment options");
    } finally {
      setLoadingEquipment(false);
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

  // Get selected slots (multiple)
  const selectedSlots = timeSlots.filter((s) =>
    formData.slotIds?.includes(s.id),
  );

  // Sort by time to ensure correct order
  const sortedSelectedSlots = selectedSlots.sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  // Calculate duration
  const duration = sortedSelectedSlots.length;

  // Calculate total for multiple slots (court + equipment)
  const calculateTotal = () => {
    if (sortedSelectedSlots.length === 0 || !formData.numberOfPlayers) return 0;

    // Court subtotal
    const courtSubtotal = sortedSelectedSlots.reduce((sum, slot) => {
      if (!formData.numberOfPlayers) return 0;
      return sum + slot.pricePerPerson * formData.numberOfPlayers;
    }, 0);

    // Equipment subtotal
    const equipmentSubtotal = calculateEquipmentSubtotal();

    return courtSubtotal + equipmentSubtotal;
  };

  // Calculate deposit for multiple slots
  const calculateDeposit = (): number => {
    if (
      !settings ||
      sortedSelectedSlots.length === 0 ||
      !formData.numberOfPlayers
    )
      return 0;
    if (!settings.require_deposit) return 0;
    const subtotal = calculateTotal();
    return Math.round(subtotal * (settings.deposit_percentage / 100));
  };

  // Calculate equipment subtotal
  const calculateEquipmentSubtotal = (): number => {
    let total = 0;
    Object.entries(equipmentQuantities).forEach(([equipmentId, quantity]) => {
      if (quantity > 0) {
        const equipment = availableEquipment.find((e) => e.id === equipmentId);
        if (equipment) {
          total += equipment.price_per_session * quantity;
        }
      }
    });
    return total;
  };

  // Get equipment rentals array for API
  const getEquipmentRentals = () => {
    const rentals: Array<{
      equipmentId: string;
      quantity: number;
      pricePerUnit: number;
    }> = [];

    Object.entries(equipmentQuantities).forEach(([equipmentId, quantity]) => {
      if (quantity > 0) {
        const equipment = availableEquipment.find((e) => e.id === equipmentId);
        if (equipment) {
          rentals.push({
            equipmentId: equipment.id,
            quantity: quantity,
            pricePerUnit: equipment.price_per_session,
          });
        }
      }
    });

    return rentals;
  };

  // Check if any equipment is selected
  const hasEquipmentSelected = (): boolean => {
    return Object.values(equipmentQuantities).some((qty) => qty > 0);
  };

  const isTimeSlotPassed = (
    slot: { time: string },
    bookingDate: Date,
  ): boolean => {
    const now = new Date();
    const slotDateTime = new Date(bookingDate);
    const timeStart = slot.time.split(" - ")[0];
    const [hours, minutes] = timeStart.split(":").map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);
    return slotDateTime < now;
  };

  const isTimeSlotTooSoon = (
    slot: { time: string },
    bookingDate: Date,
  ): boolean => {
    if (!settings) return false;
    const now = new Date();
    const slotDateTime = new Date(bookingDate);
    const timeStart = slot.time.split(" - ")[0];
    const [hours, minutes] = timeStart.split(":").map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);
    const hoursDiff = differenceInHours(slotDateTime, now);
    return hoursDiff >= 0 && hoursDiff < settings.min_advance_booking;
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const deposit = calculateDeposit();
      const total = calculateTotal();
      const paymentChoice =
        formData.paymentChoice ||
        (settings?.require_deposit ? "DEPOSIT" : "FULL");

      let amountToPay: number;
      let requireDeposit: boolean;
      let depositAmount: number;

      if (paymentChoice === "FULL") {
        amountToPay = total;
        requireDeposit = false;
        depositAmount = 0;
      } else {
        amountToPay = deposit;
        requireDeposit = true;
        depositAmount = deposit;
      }

      // Calculate display time format
      const timeDisplay =
        sortedSelectedSlots.length > 0
          ? `${sortedSelectedSlots[0].time.split(" - ")[0]} - ${
              sortedSelectedSlots[sortedSelectedSlots.length - 1].time.split(
                " - ",
              )[1]
            }`
          : "";

      // Extract time_start and time_end
      const timeStart =
        sortedSelectedSlots.length > 0
          ? sortedSelectedSlots[0].time.split(" - ")[0] + ":00"
          : "";
      const timeEnd =
        sortedSelectedSlots.length > 0
          ? sortedSelectedSlots[sortedSelectedSlots.length - 1].time.split(
              " - ",
            )[1] + ":00"
          : "";

      const bookingResponse = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: formData.courtId,
          timeSlotIds: formData.slotIds, // Array of slot IDs
          date: formData.date?.toLocaleDateString("en-CA"),
          time: timeDisplay, // "06:00 - 08:00"
          timeStart: timeStart,
          timeEnd: timeEnd,
          durationHours: duration,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerWhatsapp: formData.whatsapp,
          numberOfPlayers: formData.numberOfPlayers,
          subtotal: total,
          paymentFee: 0,
          totalAmount: amountToPay,
          paymentMethod: null,
          notes: formData.notes,
          requireDeposit: requireDeposit,
          depositAmount: depositAmount,
          fullAmount: total,
          paymentChoice: paymentChoice,
          equipmentRentals: getEquipmentRentals(),
          additionalPlayers: additionalPlayers
            .filter((p) => p.name.trim() !== "")
            .map((p) => ({
              name: p.name.trim(),
              email: p.email.trim() || undefined,
              whatsapp: p.whatsapp.trim() || undefined,
            })),
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error("Failed to create booking");
      }

      const { booking } = await bookingResponse.json();

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
      window.location.href = paymentUrl;
    } catch (error: unknown) {
      console.error("Booking error:", error);
      const err = error as {
        message?: string;
        code?: string;
        retryAfter?: number;
      };

      if (
        err.code === "RATE_LIMIT_EXCEEDED" ||
        err.code === "EMAIL_RATE_LIMIT_EXCEEDED"
      ) {
        toast.error("Rate Limit Exceeded", {
          description: `${
            err.message || "Too many attempts. Please try again later."
          }\n\nThis is a security measure to prevent spam.`,
          duration: 7000,
        });
      } else {
        toast.error("An error occurred during booking", {
          description: err.message || "Please try again later.",
          duration: 7000,
        });
      }
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setFormData({ date: new Date(), numberOfPlayers: 4, slotIds: [] });

    // Reset equipment quantities
    const resetQuantities: Record<string, number> = {};
    availableEquipment.forEach((item) => {
      resetQuantities[item.id] = 0;
    });
    setEquipmentQuantities(resetQuantities);

    // Reset additional players
    setAdditionalPlayers([
      { name: "", email: "", whatsapp: "" },
      { name: "", email: "", whatsapp: "" },
      { name: "", email: "", whatsapp: "" },
    ]);

    onOpenChange(false);
  };

  // Get max hours from settings
  const maxHours = settings?.max_booking_hours || 3;
  const reachedMaxHours = (formData.slotIds?.length || 0) >= maxHours;

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        className="max-w-4xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0"
      >
        <div
          className="custom-scrollbar"
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
                          slotIds: [], // Reset selection on date change
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
                        setFormData({
                          ...formData,
                          courtId: value,
                          slotIds: [],
                        })
                      }
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                    >
                      {courts.map((court) => (
                        <Card
                          key={court.id}
                          onClick={() => {
                            if (court.available) {
                              setFormData({
                                ...formData,
                                courtId: court.id,
                                slotIds: [],
                              });
                            }
                          }}
                          className={`mt-2 cursor-pointer transition-all ${
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

                  {/* Time Slot Selection - NEW MULTI-SELECT */}
                  <div>
                    <Label>Select Time Slot(s)</Label>

                    {settings && settings.min_advance_booking > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 mb-2">
                        Slots must be booked at least{" "}
                        {settings.min_advance_booking} hours in advance. You can
                        select up to {maxHours} contiguous hours.
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
                      <>
                        {/* Multi-Select Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          {timeSlots.map((slot, index) => {
                            const isSelected = formData.slotIds?.includes(
                              slot.id,
                            );
                            const hasPassed = formData.date
                              ? isTimeSlotPassed(slot, formData.date)
                              : false;
                            const isTooSoon = formData.date
                              ? isTimeSlotTooSoon(slot, formData.date)
                              : false;
                            const isAllowed = !hasPassed && !isTooSoon;

                            // Contiguous validation
                            const canSelect = (() => {
                              if (!isAllowed) return false;
                              if (formData.slotIds?.length === 0) return true;

                              const currentIndex = index;
                              const selectedIndices = (
                                formData.slotIds || []
                              ).map((id) =>
                                timeSlots.findIndex((s) => s.id === id),
                              );
                              const minSelected = Math.min(...selectedIndices);
                              const maxSelected = Math.max(...selectedIndices);

                              return (
                                currentIndex === minSelected - 1 ||
                                currentIndex === maxSelected + 1
                              );
                            })();

                            return (
                              <Card
                                key={slot.id}
                                onClick={() => {
                                  if (!canSelect && !isSelected) return;
                                  if (isSelected) {
                                    // Deselect
                                    setFormData({
                                      ...formData,
                                      slotIds: formData.slotIds?.filter(
                                        (id) => id !== slot.id,
                                      ),
                                    });
                                  } else if (!reachedMaxHours) {
                                    // Select
                                    setFormData({
                                      ...formData,
                                      slotIds: [
                                        ...(formData.slotIds || []),
                                        slot.id,
                                      ],
                                    });
                                  }
                                }}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-forest ring-2 ring-forest/20 bg-forest/5"
                                    : canSelect
                                      ? "hover:border-forest/50"
                                      : "opacity-50 cursor-not-allowed"
                                }`}
                              >
                                <CardContent className="p-3">
                                  <div className="flex flex-col items-center text-center gap-2">
                                    {/* Checkbox indicator */}
                                    <div
                                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        isSelected
                                          ? "bg-forest border-forest"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      )}
                                    </div>

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

                                    {!canSelect &&
                                      !hasPassed &&
                                      !isTooSoon &&
                                      !isSelected && (
                                        <div className="text-xs text-orange-500 font-medium">
                                          Not contiguous
                                        </div>
                                      )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>

                        {/* Selection Summary */}
                        {sortedSelectedSlots.length > 0 && (
                          <Alert className="mt-4 bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                              <strong>
                                Selected: {duration} hour
                                {duration > 1 ? "s" : ""}
                              </strong>
                              <p className="text-sm mt-1">
                                {sortedSelectedSlots[0].time.split(" - ")[0]} -{" "}
                                {
                                  sortedSelectedSlots[
                                    sortedSelectedSlots.length - 1
                                  ].time.split(" - ")[1]
                                }
                              </p>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Max hours warning */}
                        {reachedMaxHours && (
                          <Alert className="mt-2 bg-orange-50 border-orange-200">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800 text-sm">
                              Maximum {maxHours} hours per booking
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </div>

                  {/* Number of Players */}
                  <div>
                    <Label>Number of Players</Label>
                    <Select
                      value={formData.numberOfPlayers?.toString()}
                      onValueChange={(value) => {
                        const numPlayers = parseInt(value);
                        setFormData({
                          ...formData,
                          numberOfPlayers: numPlayers,
                        });
                        
                        // Reset additional players when number changes
                        setAdditionalPlayers([
                          { name: "", email: "", whatsapp: "" },
                          { name: "", email: "", whatsapp: "" },
                          { name: "", email: "", whatsapp: "" },
                        ]);
                      }}
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

                  {/* Equipment Rental Section */}
                  <div className="">
                    <Label className="text-base font-semibold">
                      Equipment Rental (Optional)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Add equipment to your booking. Prices are per session.
                    </p>

                    {loadingEquipment ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-forest" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading equipment...
                        </span>
                      </div>
                    ) : availableEquipment.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No equipment available at the moment
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {availableEquipment.map((equipment) => (
                          <Card
                            key={equipment.id}
                            className={`transition-all ${
                              equipmentQuantities[equipment.id] > 0
                                ? "border-forest ring-2 ring-forest/20"
                                : "hover:border-forest/50"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                {/* Equipment Info */}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm">
                                    {equipment.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {equipment.description}
                                  </p>
                                  <p className="text-sm font-bold text-forest mt-1">
                                    IDR{" "}
                                    {equipment.price_per_session.toLocaleString(
                                      "id-ID",
                                    )}
                                    <span className="text-xs font-normal text-muted-foreground">
                                      {" "}
                                      / session
                                    </span>
                                  </p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      const current =
                                        equipmentQuantities[equipment.id] || 0;
                                      if (current > 0) {
                                        setEquipmentQuantities({
                                          ...equipmentQuantities,
                                          [equipment.id]: current - 1,
                                        });
                                      }
                                    }}
                                    disabled={
                                      !equipmentQuantities[equipment.id] ||
                                      equipmentQuantities[equipment.id] === 0
                                    }
                                  >
                                    -
                                  </Button>
                                  <span className="w-8 text-center font-semibold">
                                    {equipmentQuantities[equipment.id] || 0}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      const current =
                                        equipmentQuantities[equipment.id] || 0;
                                      setEquipmentQuantities({
                                        ...equipmentQuantities,
                                        [equipment.id]: current + 1,
                                      });
                                    }}
                                    disabled={
                                      equipmentQuantities[equipment.id] >= 10
                                    } // Max 10 per item
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>

                              {/* Show subtotal if quantity > 0 */}
                              {equipmentQuantities[equipment.id] > 0 && (
                                <div className="mt-3 pt-3 border-t text-right">
                                  <span className="text-xs text-muted-foreground">
                                    Subtotal:{" "}
                                  </span>
                                  <span className="font-bold text-forest">
                                    IDR{" "}
                                    {(
                                      equipment.price_per_session *
                                      equipmentQuantities[equipment.id]
                                    ).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}

                        {/* Equipment Total */}
                        {/* {hasEquipmentSelected() && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                              <strong>Equipment Total:</strong> IDR{" "}
                              {calculateEquipmentSubtotal().toLocaleString(
                                "id-ID",
                              )}
                            </AlertDescription>
                          </Alert>
                        )} */}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={
                        !formData.courtId ||
                        !formData.slotIds ||
                        formData.slotIds.length === 0
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
                  {/* Additional Players Section */}
                  {formData.numberOfPlayers && formData.numberOfPlayers > 1 && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label className="text-base font-semibold">
                            👥 Additional Players (Optional)
                          </Label>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              You're booking for {formData.numberOfPlayers} players. Add your
                              friends' information if available.
                            </p>
                          </div>
                          
                        </div>
                        
                      </div>

                      <div className="space-y-4">
                        {Array.from({
                          length: (formData.numberOfPlayers || 1) - 1,
                        }).map((_, index) => (
                          <Card key={index} className="bg-muted/30">
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-sm mb-3">
                                Player {index + 2}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label
                                    htmlFor={`player-${index}-name`}
                                    className="text-xs"
                                  >
                                    Name
                                  </Label>
                                  <Input
                                    id={`player-${index}-name`}
                                    value={additionalPlayers[index]?.name || ""}
                                    onChange={(e) => {
                                      const updated = [...additionalPlayers];
                                      updated[index] = {
                                        ...updated[index],
                                        name: e.target.value,
                                      };
                                      setAdditionalPlayers(updated);
                                    }}
                                    placeholder="Friend's name"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`player-${index}-email`}
                                    className="text-xs"
                                  >
                                    Email
                                  </Label>
                                  <Input
                                    id={`player-${index}-email`}
                                    type="email"
                                    value={additionalPlayers[index]?.email || ""}
                                    onChange={(e) => {
                                      const updated = [...additionalPlayers];
                                      updated[index] = {
                                        ...updated[index],
                                        email: e.target.value,
                                      };
                                      setAdditionalPlayers(updated);
                                    }}
                                    placeholder="friend@example.com"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`player-${index}-whatsapp`}
                                    className="text-xs"
                                  >
                                    WhatsApp
                                  </Label>
                                  <Input
                                    id={`player-${index}-whatsapp`}
                                    value={additionalPlayers[index]?.whatsapp || ""}
                                    onChange={(e) => {
                                      const updated = [...additionalPlayers];
                                      updated[index] = {
                                        ...updated[index],
                                        whatsapp: e.target.value,
                                      };
                                      setAdditionalPlayers(updated);
                                    }}
                                    placeholder="+62 812..."
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
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

              {/* Step 3: Payment Confirmation */}
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
                        <span>
                          Court Booking ({duration} hour
                          {duration > 1 ? "s" : ""} × {formData.numberOfPlayers}{" "}
                          player
                          {formData.numberOfPlayers !== 1 ? "s" : ""}):
                        </span>
                        <span>
                          IDR{" "}
                          {sortedSelectedSlots
                            .reduce((sum, slot) => {
                              if (!formData.numberOfPlayers) return 0;
                              return (
                                sum +
                                slot.pricePerPerson * formData.numberOfPlayers
                              );
                            }, 0)
                            .toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Equipment breakdown */}
                      {hasEquipmentSelected() && (
                        <>
                          <div className="text-sm space-y-2 mt-2">
                            <div className="font-semibold text-muted-foreground">
                              Equipment Rental:
                            </div>
                            {availableEquipment.map((equipment) => {
                              const quantity =
                                equipmentQuantities[equipment.id];
                              if (quantity > 0) {
                                return (
                                  <div
                                    key={equipment.id}
                                    className="flex justify-between pl-4"
                                  >
                                    <span className="text-muted-foreground">
                                      {quantity}× {equipment.name}
                                    </span>
                                    <span>
                                      IDR{" "}
                                      {(
                                        equipment.price_per_session * quantity
                                      ).toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <Separator className="my-2" />
                        </>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {formData.date?.toLocaleDateString("en-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {sortedSelectedSlots.length > 0 && (
                            <>
                              {sortedSelectedSlots[0].time.split(" - ")[0]} -{" "}
                              {
                                sortedSelectedSlots[
                                  sortedSelectedSlots.length - 1
                                ].time.split(" - ")[1]
                              }
                              <Badge variant="outline" className="ml-2 text-xs">
                                {duration} hour{duration > 1 ? "s" : ""}
                              </Badge>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Players:</span>
                        <span className="font-medium">
                          {formData.numberOfPlayers}
                        </span>
                      </div>

                      {/* Show player names if provided */}
                      {additionalPlayers.some((p) => p.name.trim() !== "") && (
                        <div className="text-xs text-muted-foreground mt-2 pl-4">
                          <div>• {formData.name} (You)</div>
                          {additionalPlayers
                            .filter((p) => p.name.trim() !== "")
                            .map((player, idx) => (
                              <div key={idx}>• {player.name}</div>
                            ))}
                        </div>
                      )}

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

                          <div className="bg-gradient-to-r from-forest/10 to-forest/5 p-4 rounded-lg">
                            <div className="flex justify-between items-center gap-2">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {formData.paymentChoice === "FULL"
                                    ? "Total Payment"
                                    : `Deposit (${settings.deposit_percentage}%)`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {hasEquipmentSelected()
                                    ? "Includes court booking + equipment rental"
                                    : "Payment will be processed on next page"}
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
                        <strong>Cancellation Policy:</strong>
                        Full refund (100%) for cancellations made at least 24 hours before the session. 
                        Cancellations made 12–24 hours prior are eligible for a 50% refund. 
                        No refunds are available for cancellations within 12 hours of the session start time.
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
                          I understand the
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

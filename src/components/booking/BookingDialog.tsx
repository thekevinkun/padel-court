"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Download,
  MessageCircle,
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
import { courts, timeSlots, paymentMethods } from "@/lib/constants";
import { generateBookingReceipt } from "@/lib/pdf-generator";
import { sendWhatsAppReceipt } from "@/lib/whatsapp";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, name: "Court & Time", icon: Calendar },
  { id: 2, name: "Your Info", icon: Users },
  { id: 3, name: "Payment", icon: CreditCard },
];

export default function BookingDialog({
  open,
  onOpenChange,
}: BookingDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    date: new Date(),
    numberOfPlayers: 4,
  });

  const selectedCourt = courts.find((c) => c.id === formData.courtId);
  const selectedSlot = timeSlots.find((s) => s.id === formData.slotId);
  const selectedPayment = paymentMethods.find(
    (p) => p.id === formData.paymentMethod
  );

  const calculateTotal = () => {
    if (!selectedSlot || !formData.numberOfPlayers) return 0;
    const subtotal = selectedSlot.pricePerPerson * formData.numberOfPlayers;
    const paymentFee = selectedPayment?.fee || 0;
    return subtotal + paymentFee;
  };

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      // Step 1: Simulate payment processing (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 2: Generate booking reference
      const bookingRef = `BAP${Date.now().toString().slice(-8)}`;

      // Step 3: Prepare receipt data
      const receiptDataObj = {
        bookingRef,
        customerName: formData.name!,
        email: formData.email!,
        phone: formData.phone!,
        courtName: selectedCourt!.name,
        date: formData.date!.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: selectedSlot!.time,
        numberOfPlayers: formData.numberOfPlayers!,
        pricePerPerson: selectedSlot!.pricePerPerson,
        subtotal: selectedSlot!.pricePerPerson * formData.numberOfPlayers!,
        paymentMethod: selectedPayment!.name,
        paymentFee: selectedPayment!.fee,
        total: calculateTotal(),
        notes: formData.notes || "-",
        timestamp: new Date().toLocaleString("id-ID"),
      };

      // Save receipt data to state
      setReceiptData(receiptDataObj);

      // Step 4: Generate PDF receipt
      const pdfBlobGenerated = await generateBookingReceipt(receiptDataObj);

      // Save PDF to state for later download
      setPdfBlob(pdfBlobGenerated);

      // Step 5: Show success (PDF is ready but not downloaded yet)
      setIsSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred during booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setReceiptData(null);
    setPdfBlob(null);
    setFormData({ date: new Date(), numberOfPlayers: 4 });
    onOpenChange(false);
  };

  const handleDownloadPDF = () => {
    if (!pdfBlob || !receiptData) return;

    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Padel-Receipt-${receiptData.bookingRef}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(pdfUrl);
  };

  const handleShareWhatsApp = () => {
    if (!receiptData || !formData.whatsapp) return;

    const whatsappNumber = formData.whatsapp.replace(/\D/g, "");
    sendWhatsAppReceipt(whatsappNumber, receiptData, pdfBlob || undefined);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle2 className="w-10 h-10 text-forest" />
              </motion.div>
            </motion.div>

            <h3 className="heading-3 mb-2">Booking Confirmed!</h3>
            <p className="text-body mb-6">
              Your booking is confirmed. Download your receipt or share it via
              WhatsApp.
            </p>

            <div className="bg-muted rounded-lg p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Court:</span>
                <span className="font-medium">{selectedCourt?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedSlot?.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-forest">
                  IDR {calculateTotal().toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDownloadPDF}
                size="lg"
                className="w-full rounded-full hover:text-accent-foreground"
              >
                Download PDF Receipt
              </Button>
              <Button
                onClick={handleShareWhatsApp}
                variant="outline"
                size="lg"
                className="w-full rounded-full"
              >
                Share via WhatsApp
              </Button>
              <Button
                onClick={resetAndClose}
                variant="ghost"
                size="lg"
                className="w-full rounded-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                          : slot.available
                          ? "hover:border-forest/50"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex flex-col items-center text-center gap-2">
                          <RadioGroupItem
                            value={slot.id}
                            disabled={!slot.available}
                          />
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
                  {selectedPayment && selectedPayment.fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Payment Fee:</span>
                      <span>
                        IDR {selectedPayment.fee.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-forest">
                      IDR {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <div>
                <Label>Select Payment Method</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                >
                  {paymentMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-all ${
                        formData.paymentMethod === method.id
                          ? "border-forest ring-2 ring-forest/20"
                          : "hover:border-forest/50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={method.id} />
                          <div className="flex-1">
                            <div className="font-medium">{method.name}</div>
                            {method.fee > 0 && (
                              <div className="text-xs text-muted-foreground">
                                +IDR {method.fee.toLocaleString("id-ID")} fee
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </div>

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
                  I agree to the terms and conditions. This is a demo booking
                  system with simulated payment.
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
                    !formData.paymentMethod ||
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

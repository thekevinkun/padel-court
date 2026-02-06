"use client";

import { Edit, Clock, Trophy, Trash2, Plus, Loader2, Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import VersionHistoryDialog from "@/components/dashboard/VersionHistoryDialog";

import { PricingSectionCMS, PricingSubSection } from "@/types";

const PricingSection = ({
  pricing,
  setPricing,
  tempPricing,
  setTempPricing,
  pricingDialogOpen,
  setPricingDialogOpen,
  openPricingDialog,
  updatePricingItem,
  addPricingItem,
  removePricingItem,
  updatePricingNote,
  addPricingNote,
  removePricingNote,
  savingPricing,
  savePricing,
}: PricingSectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl">Pricing Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete pricing structure with all packages
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <VersionHistoryDialog
                sectionType="pricing"
                currentVersion={pricing.version || 1}
              />
              <Button onClick={openPricingDialog} className="gap-2">
                <Edit className="w-4 h-4" /> Edit All Pricing
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {pricing.badge}
              </Badge>
              <h3 className="font-semibold text-lg">{pricing.heading}</h3>
              <p className="text-sm text-muted-foreground">
                {pricing.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Notes</h3>
              {pricing.notes.map((note, index) => (
                <div key={index} className="flex items-baseline gap-2">
                  <span className="text-forest-dark mt-1">•</span>
                  <span className="text-gray-500 text-sm">{note}</span>
                </div>
              ))}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="court-rental">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-forest" />
                    Court Rental
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-6">
                    <div>
                      <p className="text-sm font-medium">
                        {pricing.courtRental.peakHours.title}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pricing.courtRental.peakHours.subtitle}
                      </p>
                      {pricing.courtRental.peakHours.items.map(
                        (item, i: number) => (
                          <div
                            key={i}
                            className="flex justify-between text-sm py-1"
                          >
                            <span>{item.name}</span>
                            <span className="font-medium">
                              IDR {item.price}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">
                        {pricing.courtRental.offPeakHours.title}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pricing.courtRental.offPeakHours.subtitle}
                      </p>
                      {pricing.courtRental.offPeakHours.items.map(
                        (item, i: number) => (
                          <div
                            key={i}
                            className="flex justify-between text-sm py-1"
                          >
                            <span>{item.name}</span>
                            <span className="font-medium">
                              IDR {item.price}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="coaching">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-forest" />
                    Coaching Packages
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-6">
                    {["headCoach", "seniorCoach", "juniorCoach"].map((key) => {
                      const pkg = pricing[
                        key as keyof typeof pricing
                      ] as PricingSubSection;
                      return (
                        <div key={key}>
                          <p className="text-sm font-medium">{pkg.title}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {pkg.subtitle}
                          </p>
                          {pkg.items.map((item, i: number) => (
                            <div
                              key={i}
                              className="flex justify-between text-sm py-1"
                            >
                              <span>{item.name}</span>
                              <span className="font-medium">
                                IDR {item.price}
                              </span>
                            </div>
                          ))}
                          {key !== "juniorCoach" && (
                            <Separator className="my-3" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rental">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-forest" />
                    {pricing.racketRental.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-6">
                    {pricing.racketRental.items.map((item, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm py-1"
                      >
                        <span>{item.name}</span>
                        <span className="font-medium">IDR {item.price}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>

      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent 
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-4xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0"
        >
          <div className="custom-scrollbar">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Edit Pricing Section</DialogTitle>
                <DialogDescription className="sr-only">
                  Find the right price and text for your pricing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="mt-4">
                    <Label>Badge</Label>
                    <Input
                      value={tempPricing.badge}
                      onChange={(e) =>
                        setTempPricing({
                          ...tempPricing,
                          badge: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div className="mt-4">
                    <Label>Heading</Label>
                    <Input
                      value={tempPricing.heading}
                      onChange={(e) =>
                        setTempPricing({
                          ...tempPricing,
                          heading: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={tempPricing.description}
                    onChange={(e) =>
                      setTempPricing({
                        ...tempPricing,
                        description: e.target.value,
                      })
                    }
                    className="mt-2"
                    rows={2}
                  />
                </div>

                <Separator />

                {/* Pricing Notes */}
                <div>
                  <h3 className="font-semibold mb-3">Pricing Notes</h3>

                  <div className="space-y-3">
                    {tempPricing.notes.map((note, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <Textarea
                          value={note}
                          rows={2}
                          onChange={(e) =>
                            updatePricingNote(index, e.target.value)
                          }
                          placeholder="Enter pricing note"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePricingNote(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addPricingNote}
                      className="w-fit"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Note
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Court Rental - Peak Hours */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-forest" />
                    Peak Hours Court Rental
                  </h3>
                  <div className="space-y-3 pl-6">
                    {tempPricing.courtRental.peakHours.items.map(
                      (item, i: number) => (
                        <div
                          key={i}
                          className="grid grid-cols-3 gap-2 items-end"
                        >
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                updatePricingItem(
                                  "courtRental.peakHours",
                                  i,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Price (IDR)</Label>
                            <Input
                              value={item.price}
                              onChange={(e) =>
                                updatePricingItem(
                                  "courtRental.peakHours",
                                  i,
                                  "price",
                                  e.target.value,
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              removePricingItem("courtRental.peakHours", i)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ),
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPricingItem("courtRental.peakHours")}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Item
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Court Rental - Off-Peak Hours */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-forest" />
                    Off-Peak Hours Court Rental
                  </h3>
                  <div className="space-y-3 pl-6">
                    {tempPricing.courtRental.offPeakHours.items.map(
                      (item, i: number) => (
                        <div
                          key={i}
                          className="grid grid-cols-3 gap-2 items-end"
                        >
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                updatePricingItem(
                                  "courtRental.offPeakHours",
                                  i,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Price (IDR)</Label>
                            <Input
                              value={item.price}
                              onChange={(e) =>
                                updatePricingItem(
                                  "courtRental.offPeakHours",
                                  i,
                                  "price",
                                  e.target.value,
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              removePricingItem("courtRental.offPeakHours", i)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ),
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPricingItem("courtRental.offPeakHours")}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Item
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Coaching Packages */}
                {["headCoach", "seniorCoach", "juniorCoach"].map(
                  (coachType) => {
                    const pkg = pricing[
                      coachType as keyof typeof pricing
                    ] as PricingSubSection;
                    return (
                      <div key={coachType}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-forest" />
                          {pkg.title}
                        </h3>
                        <div className="space-y-3 pl-6">
                          {pkg.items.map((item, i: number) => (
                            <div
                              key={i}
                              className="grid grid-cols-3 gap-2 items-end"
                            >
                              <div>
                                <Label className="text-xs">Name</Label>
                                <Input
                                  value={item.name}
                                  onChange={(e) =>
                                    updatePricingItem(
                                      coachType,
                                      i,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Price (IDR)</Label>
                                <Input
                                  value={item.price}
                                  onChange={(e) =>
                                    updatePricingItem(
                                      coachType,
                                      i,
                                      "price",
                                      e.target.value,
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removePricingItem(coachType, i)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addPricingItem(coachType)}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Item
                          </Button>
                        </div>
                        <Separator className="my-4" />
                      </div>
                    );
                  },
                )}

                {/* Racket Rental */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-forest" />
                    Racket Rental
                  </h3>
                  <div className="space-y-3 pl-6">
                    {pricing.racketRental.items.map((item, i: number) => (
                      <div key={i} className="grid grid-cols-3 gap-2 items-end">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              updatePricingItem(
                                "racketRental",
                                i,
                                "name",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Price (IDR)</Label>
                          <Input
                            value={item.price}
                            onChange={(e) =>
                              updatePricingItem(
                                "racketRental",
                                i,
                                "price",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePricingItem("racketRental", i)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPricingItem("racketRental")}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Item
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPricingDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={savePricing}
                    disabled={savingPricing}
                  >
                    {savingPricing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Pricing"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PricingSection;

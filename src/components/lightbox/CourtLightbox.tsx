"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, CheckCircle2 } from "lucide-react";
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

import { useBooking } from "@/contexts/BookingContext";
import { Court } from "@/types";
import { blurDataURL } from "@/lib/image-blur";
import { ImagePresets } from "@/lib/supabase/image-transform";

interface CourtLightboxProps {
  court: Court | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CourtLightbox = ({ court, open, onOpenChange }: CourtLightboxProps) => {
  const { openBooking } = useBooking();

  if (!court) return null;

  const handleBookNow = () => {
    onOpenChange(false);
    openBooking();
  };

  // Use court features from database, or fallback to default
  const features =
    court.features && court.features.length > 0
      ? court.features
      : [
          "Professional-grade surface",
          "Perfect lighting conditions",
          "Climate-controlled environment",
          "Spectator seating area",
          "Easy access & parking",
          "Equipment rental available",
        ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{court.name}</DialogTitle>
          <DialogDescription className="sr-only">
            {court.description}
          </DialogDescription>
        </DialogHeader>

        <div className="custom-scrollbar">
          <div>
            {/* Image Section */}
            <div className="relative w-full aspect-video">
              <Image
                src={
                  court.image_url
                    ? ImagePresets.courtFeatured(court.image_url)
                    : "/images/court-placeholder.png"
                }
                alt={court.name}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    className={`${
                      court.available
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    {court.available ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Available
                      </>
                    ) : (
                      "Under Maintenance"
                    )}
                  </Badge>
                </div>
                <h2 className="heading-2 text-foreground mb-2">{court.name}</h2>
                <p className="text-body leading-relaxed">{court.description}</p>
              </div>

              <Separator />

              {/* Features/Highlights - NOW DYNAMIC */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-forest" />
                  Court Features
                </h3>
                {features.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No features listed for this court yet.
                  </p>
                )}
              </div>

              <Separator />

              {/* CTA Section */}
              <div className="bg-gradient-to-br from-forest/5 to-primary/5 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Ready to Play?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Book this court now and experience world-class padel
                  facilities
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleBookNow}
                    size="lg"
                    disabled={!court.available}
                    className="md:flex-1 rounded-full font-semibold hover:text-accent-foreground"
                  >
                    Book This Court Now
                  </Button>
                  <Button
                    onClick={() => onOpenChange(false)}
                    size="lg"
                    variant="outline"
                    className="md:flex-1 rounded-full font-semibold"
                  >
                    Continue Browsing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourtLightbox;

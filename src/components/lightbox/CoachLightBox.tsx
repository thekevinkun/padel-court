"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, Award, Clock, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Coach } from "@/types";
import { blurDataURL } from "@/lib/image-blur";

interface CoachLightboxProps {
  coach: Coach | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CoachLightbox = ({ coach, open, onOpenChange }: CoachLightboxProps) => {
  if (!coach) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{coach.name}</DialogTitle>
          <DialogDescription>{coach.bio}</DialogDescription>
        </DialogHeader>

        <div className="custom-scrollbar">
          {/* Image */}
          <div className="relative w-full aspect-video">
            <Image
              src={
                coach.image_url
                  ? coach.image_url
                  : "/images/coach-placeholder.webp"
              }
              alt={coach.name}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-top"
              priority
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {/* Name overlay on image */}
            <div className="absolute bottom-0 left-0 p-6">
              <Badge className="mb-2 bg-primary/90 text-black font-semibold">
                {coach.role}
              </Badge>
              <h2 className="text-3xl font-bold text-white font-display">
                {coach.name}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Bio */}
            <p className="text-body leading-relaxed">{coach.bio}</p>

            <Separator />

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {coach.experience && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-forest/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-forest" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-semibold">{coach.experience}</p>
                  </div>
                </div>
              )}
              {coach.nationality && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nationality</p>
                    <p className="text-sm font-semibold">{coach.nationality}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Specialties */}
            {coach.specialties?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-forest" />
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map((s, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-3 py-1 bg-forest/10 text-forest rounded-full text-sm font-medium border border-forest/20"
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Certifications */}
            {coach.certifications?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-forest" />
                    Certifications
                  </h3>
                  <div className="space-y-2">
                    {coach.certifications.map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Award className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {c}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Instagram CTA */}
            {coach.instagram_url && (
              <>
                <Separator />

                <div className="bg-gradient-to-br from-forest/5 to-primary/5 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Follow on Instagram
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Stay updated with {coach.name}'s training tips & highlights
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full font-semibold"
                    >
                      <Link
                        href={coach.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        Follow
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoachLightbox;

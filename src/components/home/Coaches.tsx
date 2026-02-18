"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { Coach, CoachesContent } from "@/types";
import { blurDataURL } from "@/lib/image-blur";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const CoachLightbox = dynamic(
  () => import("@/components/lightbox/CoachLightBox"),
  { ssr: false },
);

interface CoachesProps {
  content: CoachesContent;
}

const Coaches = ({ content }: CoachesProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const openLightbox = (coach: Coach) => {
    setSelectedCoach(coach);
    setLightboxOpen(true);
  };

  return (
    <>
      <section id="coaches" className="relative bg-background z-10">
        {/* Decorative blobs — same as Courts */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl -z-10" />

        <div className="container-custom">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-12 md:mb-16"
          >
            <motion.div variants={fadeInUp} className="mb-4">
              <Badge className="bg-forest/10 text-forest border-forest/20 lg:text-base font-medium px-4 py-2">
                {content.badge}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="heading-2 mb-4">
              {content.heading}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-body max-w-xl mx-auto"
            >
              {content.description}
            </motion.p>
          </motion.div>

          {/* 3-column grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {content.coaches.map((coach) => (
              <motion.div key={coach.id} variants={fadeInUp}>
                <Card
                  onClick={() => openLightbox(coach)}
                  className="group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border-0"
                >
                  {/* Square-ish portrait */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={coach.image_url ? coach.image_url : "/images/coach-placeholder.webp"}
                      alt={coach.name}
                      fill
                      quality={85}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                    />

                    {/* Gradient overlay — always present, stronger on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                    {/* Hover reveal: Name + Instagram */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-bold text-lg font-display leading-tight mb-2">
                        {coach.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">
                          {coach.role}
                        </span>
                        {coach.instagram_url && (
                          <Link
                            href={coach.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Instagram className="w-4 h-4 text-white" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <CoachLightbox
        coach={selectedCoach}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
};

export default Coaches;

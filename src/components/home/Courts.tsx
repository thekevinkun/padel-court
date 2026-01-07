"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Expand } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import CourtLightbox from "./CourtLightBox";

import { Court } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const Courts = ({ courts }: { courts: Court[] } ) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  // First court is featured, rest are regular
  const featuredCourt = courts[0];
  const regularCourts = courts.slice(1);

  const openLightbox = (court: Court) => {
    setSelectedCourt(court);
    setLightboxOpen(true);
  };

  if (!courts || courts.length === 0) {
    return null; // Don't show section if no courts
  }

  return (
    <>
      <section className="relative section-py bg-background">
        {/* Decorative background elements */}
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
                Our Courts
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="heading-2 mb-4">
              World-Class Facilities
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-body max-w-2xl mx-auto"
            >
              Experience padel at its finest on our premium courts, designed for
              players of all levels
            </motion.p>
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {/* Featured Court (Large - Takes 2x2 on desktop) */}
            {featuredCourt && (
              <motion.div
                variants={fadeInUp}
                className="md:col-span-2 lg:row-span-2"
              >
                <Card
                  onClick={() => openLightbox(featuredCourt)}
                  className="group relative h-full min-h-[400px] md:min-h-[500px] overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={
                        featuredCourt.image_url ||
                        "/images/court-placeholder.png"
                      }
                      alt={featuredCourt.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <Badge className="w-fit mb-3 bg-primary/90 text-black font-semibold">
                      Featured Court
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-display">
                      {featuredCourt.name}
                    </h3>
                    <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-2">
                      {featuredCourt.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                      <span className="text-sm font-medium">View Details</span>
                      <Expand className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Regular Courts */}
            {regularCourts.map((court, index) => (
              <motion.div
                key={court.id}
                variants={fadeInUp}
                className={`${
                  // Make some courts span 2 columns on desktop for variety
                  index === 1
                    ? "lg:col-span-1"
                    : index === 2
                    ? "lg:col-span-2"
                    : ""
                }`}
              >
                <Card
                  onClick={() => openLightbox(court)}
                  className="group relative h-full min-h-[250px] md:min-h-[300px] overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={court.image_url || "/images/court-placeholder.png"}
                      alt={court.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Content */}
                  <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 font-display">
                      {court.name}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm line-clamp-1 mb-2">
                      {court.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium">Expand</span>
                      <Expand className="w-3 h-3" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <CourtLightbox
        court={selectedCourt}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
};

export default Courts;

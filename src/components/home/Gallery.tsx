"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { GalleryContent } from "@/types";
import { blurDataURL } from "@/lib/image-blur";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const GalleryLightbox = dynamic(
  () => import("@/components/lightbox/GalleryLightbox"),
  {
    ssr: false,
  }
);

interface GalleryProps {
  content: GalleryContent;
}

const Gallery = ({ content }: GalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  // Grid layout configuration
  // Total: 8 images + 1 note card = 9 items
  const gridItems = [
    // Row 1: 2 items (1 image + 1 note)
    {
      type: "image",
      span: "col-span-2",
      aspect: "aspect-[4/3]",
      index: 0,
      priority: true,
    },
    { type: "note", span: "col-span-1", aspect: "aspect-[4/3]" },
    // Row 2: 3 images
    {
      type: "image",
      span: "col-span-1",
      aspect: "aspect-square",
      index: 1,
      priority: true,
    },
    {
      type: "image",
      span: "col-span-1",
      aspect: "aspect-square",
      index: 2,
      priority: true,
    },
    {
      type: "image",
      span: "col-span-1",
      aspect: "aspect-square",
      index: 3,
      priority: false,
    },
    // Row 3: 2 images (one wide)
    {
      type: "image",
      span: "col-span-2",
      aspect: "aspect-video",
      index: 4,
      priority: false,
    },
    {
      type: "image",
      span: "col-span-1",
      aspect: "aspect-[3/4]",
      index: 5,
      priority: false,
    },
    // Row 4: 3 images
    {
      type: "image",
      span: "col-span-1",
      aspect: "aspect-[4/3]",
      index: 6,
      priority: false,
    },
    {
      type: "image",
      span: "col-span-1",
      aspect: "aspect-[4/3]",
      index: 7,
      priority: false,
    },
    {
      type: "image",
      span: "col-span-1",
      aspect: "aspect-[4/3]",
      index: 8,
      priority: false,
    },
  ];

  return (
    <>
      <section
        id="gallery"
        className="pb-16 md:pb-24 lg:pb-32 bg-background relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl -z-10" />

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
              className="text-body max-w-2xl mx-auto"
            >
              {content.description}
            </motion.p>
          </motion.div>

          {/* Gallery Grid - 2 cols mobile, 3 cols desktop */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6"
          >
            {gridItems.map((item, idx) => {
              if (item.type === "note") {
                // Note Card
                return (
                  <motion.div
                    key={`note-${idx}`}
                    variants={fadeInUp}
                    className={`${item.span}`}
                  >
                    <Card className="h-full bg-gradient-to-br from-black via-gray-900 to-black border-0 overflow-hidden">
                      <div
                        className={`${item.aspect} p-8 md:p-10 flex flex-col justify-center items-center text-center`}
                      >
                        <h3 className="text-2xl md:text-4xl font-bold text-primary mb-5 font-display">
                          {content.note.title}
                        </h3>
                        <p className="text-white/80 text-sm md:text-base leading-relaxed">
                          {content.note.description}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                );
              }

              // Image Card
              const imageIndex = item.index!;
              const image = content.images[imageIndex];

              if (!image) return null;

              return (
                <motion.div
                  key={image.id}
                  variants={fadeInUp}
                  className={`${item.span}`}
                >
                  <Card
                    onClick={() => openLightbox(imageIndex)}
                    className="group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border-0"
                  >
                    <div className={`${item.aspect} relative overflow-hidden`}>
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        quality={85} // ← Good quality for gallery
                        priority={item.priority} // ← Priority for above-fold images
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 50vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500 hover-scale"
                        loading={item.priority ? undefined : "lazy"}
                        placeholder="blur"
                        blurDataURL={blurDataURL}
                      />

                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Caption on Hover */}
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-xs sm:text-sm md:text-base font-medium line-clamp-2">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <GalleryLightbox
        images={content.images}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        initialIndex={selectedImageIndex}
      />
    </>
  );
};

export default Gallery;

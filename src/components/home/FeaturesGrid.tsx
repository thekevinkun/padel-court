"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

import { features } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const FeaturesGrid = () => {
  return (
    <section className="bg-muted/30">
      <div>
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`overflow-hidden border-0 shadow-lg !py-0 !rounded-none ${
                feature.type === "image"
                  ? "row-span-1"
                  : "row-span-1 md:row-span-1"
              }`}
            >
              {feature.type === "image" ? (
                // Image Grid Item
                <div className="relative aspect-square md:aspect-[4/5] group">
                  <Image
                    src={feature.src}
                    alt={feature.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                // Text Grid Item with Background
                <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden">
                  {/* Background Image with Low Opacity */}
                  <div className="absolute inset-0">
                    <Image
                      src={feature.bgImage}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Primary Color Overlay */}
                  <div className="absolute inset-0 bg-primary/80" />

                  {/* Content */}
                  <CardContent className="relative h-full flex flex-col justify-center p-6 md:py-8 md:px-10 lg:py-10 xl:px-16">
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.5 }}
                      variants={staggerContainer}
                      className="space-y-4 text-center"
                    >
                      {/* Icon */}
                      <motion.div
                        variants={fadeInUp}
                        className="justify-items-center"
                      >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-black/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-accent-foreground" />
                        </div>
                      </motion.div>

                      {/* Title */}
                      <motion.h3
                        variants={fadeInUp}
                        className="text-xl md:text-2xl font-bold text-accent-foreground font-display leading-tight"
                      >
                        {feature.title}
                      </motion.h3>

                      {/* Description */}
                      <motion.p
                        variants={fadeInUp}
                        className="text-sm md:text-base text-accent-foreground/80 leading-relaxed"
                      >
                        {feature.description}
                      </motion.p>
                    </motion.div>
                  </CardContent>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

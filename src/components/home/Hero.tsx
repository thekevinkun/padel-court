"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useBooking } from "@/contexts/BookingContext";
import { HeroContent } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const Hero = ({ content }: { content: HeroContent }) => {
  const { openBooking } = useBooking();

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${content.image_url}')`,
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center pt-18">
        <div className="container-custom">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/30 text-xs md:text-sm font-medium"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {content.badge}
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="heading-1 text-accent mb-6"
            >
              Your Premium{" "}
              <span className="text-primary italic">Padel Experience</span>{" "}
              Starts Here
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 md:mb-10 max-w-2xl leading-relaxed"
            >
              {content.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={openBooking}
                size="lg"
                className="w-fit rounded-full font-semibold hover:scale-105 hover:!text-accent transition-transform group"
              >
                {content.ctaPrimary.text}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-fit border-2 border-accent bg-transparent text-accent hover:bg-accent hover:text-accent-foreground font-semibold rounded-lg group"
              >
                <Link href="#pricing">
                  {content.ctaSecondary.text}
                  <Play className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-12 mt-8 md:mt-16 pt-8 md:pt-10 border-t border-white/20"
            >
              {content.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-display">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-300 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[5]" />
    </section>
  );
};

export default Hero;

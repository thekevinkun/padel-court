"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/30 text-sm font-medium"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                #1 Padel Club in Batu Alam Permai
              </Badge>
            </motion.div>

            {/* Main Heading - Using heading-1 utility class */}
            <motion.h1
              variants={fadeInUp}
              className="heading-1 text-white mb-6"
            >
              Your Premium{" "}
              <span className="text-primary italic">Padel Experience</span>{" "}
              Starts Here
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl leading-relaxed"
            >
              World-class courts. Professional coaching. Seamless booking.
              Everything you need for the perfect game.
            </motion.p>

            {/* CTA Buttons - Using customized shadcn Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Primary Button - uses forest by default */}
              <Button
                asChild
                size="lg"
                className="w-fit rounded-full font-semibold hover:scale-105 transition-transform group"
              >
                <Link href="#booking">
                  BOOK NOW
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              {/* Secondary Button - outline variant */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-fit border-2 border-white bg-transparent text-white hover:bg-white hover:text-black font-semibold rounded-lg group"
              >
                <Link href="#pricing">
                  VIEW PRICING
                  <Play className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-6 md:gap-12 mt-16 pt-10 border-t border-white/20"
            >
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary font-display">
                  4+
                </div>
                <div className="text-sm md:text-base text-gray-300 mt-1">
                  Premium Courts
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary font-display">
                  500+
                </div>
                <div className="text-sm md:text-base text-gray-300 mt-1">
                  Happy Players
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary font-display">
                  24/7
                </div>
                <div className="text-sm md:text-base text-gray-300 mt-1">
                  Online Booking
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1.2,
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2 text-white">
          <span className="text-sm font-medium">Scroll to explore</span>
          <svg
            className="w-6 h-6 animate-bounce"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[5]" />
    </section>
  );
}

export default Hero;
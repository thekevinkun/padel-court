"use client";

import React from "react";
import { motion } from "framer-motion";
import { Parallax } from "react-scroll-parallax";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CTAContent } from "@/types";
import { ImagePresets } from "@/lib/supabase/image-transform";

interface CTAProps {
  content: CTAContent;
}

const CTA = ({ content }: CTAProps) => {
  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden mb-16">
      {/* Parallax Background */}
      <Parallax
        speed={-30}
        className="absolute inset-0 z-[-999]"
        disabled={
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        }
      >
        <div
          className="absolute inset-0 top-[-30px] md:top-[-20px] bg-cover bg-center h-[120%]"
          style={{
            backgroundImage: `url('${ImagePresets.backgroundImage(
              content.backgroundImage
            )}')`,
          }}
        />
      </Parallax>

      {/* Dark Overlay - Half Shadow */}
      <div
        className="absolute inset-0 bg-transparent bg-[linear-gradient(130deg,#000000_49%,#0D1301D1_34%)] 
          opacity-70 transition-[background,border-radius,opacity] duration-300"
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-display italic leading-tight">
              {content.title}
            </h2>

            {/* Subtitle */}
            <p className="max-w-sm md:max-w-lg text-base md:text-lg text-white/90 mb-8 leading-relaxed">
              {content.subtitle}
            </p>

            {/* CTA Button */}
            <Button
              asChild
              size="lg"
              className="rounded-full font-semibold hover:scale-105 hover:text-accent transition-transform group"
            >
              <a href={content.buttonLink}>
                {content.buttonText}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient for Footer Overlap */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black/50" /> */}
    </section>
  );
};

export default CTA;

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { blurDataURL } from "@/lib/image-blur";
import { ImagePresets } from "@/lib/supabase/image-transform";
import { fadeInUp, staggerContainer } from "@/lib/animations";

import { PageHeroContent } from "@/types";

const PageHero = ({ content }: { content: PageHeroContent }) => {
  return (
    <section className="relative h-[50vh] w-full overflow-hidden">
      {/* Background Image - OPTIMIZED */}
      <div className="absolute inset-0 z-0">
        <Image
          src={
            content.image_url
              ? ImagePresets.pageHero(content.image_url)
              : "/images/placeholder-court.webp"
          }
          alt={content.title}
          fill
          priority
          fetchPriority="high"
          quality={90} // High quality for page heroes
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL={blurDataURL}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-5 h-full w-full flex items-center justify-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl text-center px-4"
        >
          {/* Main Heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-display"
          >
            {content.title}
          </motion.h1>

          {/* Subtitle */}
          {content.subtitle && (
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
            >
              {content.subtitle}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Dark Overlay - Half Shadow */}
      <div
        className="absolute inset-0 bg-transparent bg-[linear-gradient(130deg,#000000_40%,#2a2d2f_34%)]
        opacity-45 transition-[background,border-radius,opacity] duration-300"
      />
    </section>
  );
};

export default PageHero;

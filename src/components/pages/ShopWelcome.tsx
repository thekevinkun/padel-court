"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useBooking } from "@/contexts/BookingContext";
import { useSettings } from "@/hooks/useSettings";
import { ShopWelcomeContent } from "@/types";

import { BUSINESS_PHONE } from "@/lib/constants";
import { blurDataURL } from "@/lib/image-blur";
import { ImagePresets } from "@/lib/supabase/image-transform";
import { fadeInUp, fadeIn, slideInLeft } from "@/lib/animations";

const ShopWelcome = ({ content }: { content: ShopWelcomeContent }) => {
  const { openBooking } = useBooking();
  const { settings } = useSettings();

  const whatsapp = settings?.whatsapp || BUSINESS_PHONE;
  return (
    <section className="section-py bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* LEFT: Overlapping Images */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="relative order-1"
          >
            <div className="relative h-[500px] md:h-[600px]">
              {/* Image 1 - Background (Top Right) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="absolute top-0 right-0 w-[65%] h-[70%] rounded-2xl overflow-hidden shadow-2xl z-10"
              >
                <Image
                  src={
                    content.images[0]
                      ? ImagePresets.shopWelcome(content.images[0])
                      : "/images/placeholder-court.webp"
                  }
                  alt="Shop interior"
                  fill
                  quality={85}
                  priority
                  sizes="(max-width: 768px) 65vw, (max-width: 1024px) 35vw, 30vw"
                  className="object-cover object-[75%_25%]"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                />
              </motion.div>

              {/* Image 2 - Foreground (Bottom Left, Overlaps) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInLeft}
                className="absolute bottom-[-60] md:bottom-[-85] left-0 w-[65%] h-[55%] rounded-2xl overflow-hidden shadow-2xl z-20"
              >
                <Image
                  src={
                    content.images[1]
                      ? ImagePresets.shopWelcome(content.images[1])
                      : "/images/placeholder-court.webp"
                  }
                  alt="Padel equipment"
                  fill
                  quality={85}
                  priority
                  sizes="(max-width: 768px) 65vw, (max-width: 1024px) 35vw, 30vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT: White Card with Text Overlay */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="mt-18 md:mt-24 lg:mt-0 order-1 lg:order-2"
          >
            {/* White Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 lg:p-12 relative">
              {/* Badge */}
              <Badge
                variant="outline"
                className="border-forest/30 text-forest bg-forest/5 text-sm md:text-base px-4 py-2 font-medium mb-4"
              >
                {content.badge}
              </Badge>

              {/* Main Heading */}
              <h2 className="heading-2 text-foreground mb-4">
                Gear Up in Our
                <br />
                <span className="italic text-primary">Padel Shop</span>
              </h2>

              {/* Description */}
              <p className="text-body mb-8">{content.description}</p>

              {/* Subheading */}
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 font-display">
                {content.subheading}
              </h3>

              {/* Subdescription */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
                {content.subdescription}
              </p>

              {/* CTA Button */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-fit uppercase border-forest font-semibold bg-transparent hover:bg-forest 
                      text-accent-foreground hover:text-accent hover:scale-105 transition-transform group"
                >
                  <Link
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content.cta.primary.text}
                  </Link>
                </Button>

                <Button
                  onClick={openBooking}
                  size="lg"
                  className="w-fit uppercase font-semibold hover:scale-105 transition-transform group"
                >
                  <Link href={content.cta.secondary.href}>
                    {content.cta.secondary.text}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ShopWelcome;

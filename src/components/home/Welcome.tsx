"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { fadeInUp, fadeIn, slideInLeft, slideInRight } from "@/lib/animations";

const Welcome = () => {
  return (
    <section className="section-py bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl -z-10" />

      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Images Collage */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {/* Top Left Image */}
              <motion.div
                variants={slideInLeft}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl"
              >
                <Image
                  src="/images/welcome-1.jpg"
                  alt="Padel court"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>

              {/* Top Right Image - Offset */}
              <motion.div
                variants={slideInRight}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl mt-8 md:mt-12"
              >
                <Image
                  src="/images/welcome-2.jpg"
                  alt="Padel racket and ball"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>

              {/* Bottom Left Image - Offset */}
              <motion.div
                variants={slideInLeft}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl -mt-8 md:-mt-12"
              >
                <Image
                  src="/images/welcome-3.jpg"
                  alt="Two girls padel player"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>

              {/* Bottom Right Image */}
              <motion.div
                variants={slideInRight}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl"
              >
                <Image
                  src="/images/welcome-4.jpg"
                  alt="Padel man serving"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10"
            >
              <Badge className="bg-forest text-accent px-6 py-3 text-sm font-semibold shadow-xl hover:bg-forest-dark">
                <Sparkles className="w-4 h-4 mr-2" />
                Premium Experience
              </Badge>
            </motion.div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <Badge
                variant="outline"
                className="border-forest/30 text-forest bg-forest/5 lg:text-base px-4 py-2 font-medium"
              >
                🎾 WELCOME TO PADEL BATU ALAM PERMAI
              </Badge>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={fadeInUp}
              className="heading-2 text-foreground"
            >
              Where <span className="text-forest italic">Premium Courts</span>{" "}
              Meet Paradise Setting
            </motion.h2>

            {/* Description */}
            <motion.p variants={fadeInUp} className="text-body max-w-xl">
              Discover Indonesia's Samarinda finest padel destination nestled in
              the heart of Batu Alam Permai. Our state-of-the-art facilities
              blend world-class infrastructure with natural tropical beauty,
              creating an unmatched playing experience for enthusiasts of all
              levels.
            </motion.p>

            {/* Features Cards */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 gap-4 pt-2"
            >
              <Card className="border-forest/20 hover:border-forest/40 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <Users className="w-5 h-5 text-forest" />
                  <div className="text-sm font-medium">
                    Professional Coaching
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expert trainers available
                  </p>
                </CardContent>
              </Card>
              <Card className="border-forest/20 hover:border-forest/40 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <Clock className="w-5 h-5 text-forest" />
                  <div className="text-sm font-medium">Flexible Hours</div>
                  <p className="text-xs text-muted-foreground">
                    Open daily 6 AM - 11 PM
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <Separator className="my-4" />

            {/* CTA Button */}
            <motion.div variants={fadeInUp} className="pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-full font-semibold hover:scale-105 transition-transform group hover:text-accent-foreground"
              >
                <Link href="#booking">
                  RESERVE YOUR COURT
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;

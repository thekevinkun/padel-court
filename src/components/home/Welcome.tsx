"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { WelcomeContent } from "@/types";
import { fadeInUp, fadeIn, slideInLeft, slideInRight } from "@/lib/animations";

const Welcome = ({ content }: { content: WelcomeContent }) => {
  // Map icon names to actual icon components
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Users: Users,
      Clock: Clock,
      Sparkles: Sparkles,
      MapPin: MapPin,
    };
    return icons[iconName] || Sparkles;
  };

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
              {/* Map through content.images */}
              {content.images.map((image, index) => {
                const variants = [
                  slideInLeft,
                  slideInRight,
                  slideInLeft,
                  slideInRight,
                ];
                const mtClasses = ["", "mt-8 md:mt-12", "-mt-8 md:-mt-12", ""];

                return (
                  <motion.div
                    key={index}
                    variants={variants[index]}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl ${mtClasses[index]}`}
                  >
                    <Image
                      src={image}
                      alt={`${content.heading} - Image ${index + 1}`}
                      fill
                      quality={85} // Good quality for collage
                      priority={index < 2} // Priority for first 2 visible images
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      loading={index < 2 ? undefined : "lazy"}
                    />
                  </motion.div>
                );
              })}
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
                {content.badge}
              </Badge>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={fadeInUp}
              className="heading-2 text-foreground"
            >
              {content.heading}
            </motion.h2>

            {/* Description */}
            <motion.p variants={fadeInUp} className="text-body max-w-xl">
              {content.description}
            </motion.p>

            {/* Features Cards */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 gap-4 pt-2"
            >
              {content.features.map((feature, index) => {
                const Icon = getIcon(feature.icon);

                return (
                  <Card
                    key={index}
                    className="border-forest/20 hover:border-forest/40 transition-colors"
                  >
                    <CardContent className="p-4 space-y-2">
                      <Icon className="w-5 h-5 text-forest" />
                      <div className="text-sm font-medium">{feature.title}</div>
                      <p className="text-xs text-muted-foreground">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
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
                  {content.cta.text}
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

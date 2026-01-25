"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { Activity } from "@/types";
import { blurDataURL } from "@/lib/image-blur";
import { ImagePresets } from "@/lib/supabase/image-transform";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface ActivitiesProps {
  activities: Activity[];
}

const Activities = ({ activities }: ActivitiesProps) => {
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <section className="section-py relative overflow-hidden">
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
              What We Offer
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="heading-2 mb-4">
            Activities & Programs
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-body mx-auto">
            From casual play to competitive tournaments, discover all the ways
            to enjoy padel at our facility
          </motion.p>
        </motion.div>

        {/* Activities Grid - Responsive 3 columns */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {activities.map((activity, index) => (
            <motion.div key={activity.id} variants={fadeInUp}>
              <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-forest/30">
                <CardContent className="p-0">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={
                        activity.image_url
                          ? ImagePresets.activityCard(activity.image_url)
                          : "/images/placeholder-court.webp"
                      }
                      alt={activity.title}
                      fill
                      quality={85}
                      priority={index < 3} // Priority for first row
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading={index < 3 ? undefined : "lazy"}
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="font-display font-bold text-xl text-foreground mb-3 group-hover:text-forest transition-colors">
                      {activity.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {activity.description}
                    </p>

                    {/* Decorative Bottom Line */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="w-12 h-1 bg-gradient-to-r from-forest to-primary rounded-full group-hover:w-full transition-all duration-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Activities;

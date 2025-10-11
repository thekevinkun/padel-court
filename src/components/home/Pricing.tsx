"use client";

import { motion } from "framer-motion";
import { Clock, Trophy, Info, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  pricingSections,
  coachingPackages,
  racketRental,
  pricingNotes,
} from "@/lib/constants";

const sectionIcons = {
  "peak-hours": Clock,
  "off-peak-hours": Zap,
  "head-coach": Trophy,
};

const Pricing = () => {
  return (
    <section id="pricing" className="section-py bg-background">
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
              💰 Our Pricing List
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="heading-2 mb-4">
            Simple, Clear <span className="text-forest">Pricing Plans</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-body max-w-2xl mx-auto">
            Choose the perfect option for your padel experience at Batu Alam
            Permai
          </motion.p>
        </motion.div>

        {/* Important Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm space-y-1">
              {pricingNotes.map((note, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{note}</span>
                </div>
              ))}
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Main Pricing Sections */}
        <div className="space-y-12">
          {pricingSections.map((section, sectionIndex) => {
            const Icon = sectionIcons[section.id as keyof typeof sectionIcons];

            return (
              <div key={section.id}>
                {/* Section Title - Animated */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {Icon && (
                      <div className="w-10 h-10 bg-forest/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-forest" />
                      </div>
                    )}
                    <h3 className="heading-3 text-foreground">
                      {section.title}
                    </h3>
                  </div>
                  {section.subtitle && (
                    <p className="text-sm text-muted-foreground ml-13">
                      {section.subtitle}
                    </p>
                  )}
                </motion.div>

                {/* Pricing Items - Static */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, itemIndex) => (
                    <Card
                      key={itemIndex}
                      className="hover:shadow-md transition-shadow border-border/50"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-forest">
                              {item.price}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {sectionIndex < pricingSections.length - 1 && (
                  <Separator className="mt-12" />
                )}
              </div>
            );
          })}
        </div>

        {/* Coaching Packages - Cards */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {coachingPackages.map((pkg, pkgIndex) => (
            <div key={pkgIndex}>
              {/* Package Title - Animated */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="heading-3 text-foreground">{pkg.title}</h3>
                </div>
              </motion.div>

              {/* Package Card - Static */}
              <Card className="border-forest/20 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  {pkg.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {item.name}
                          </h4>
                        </div>
                        <div className="font-bold text-xl text-forest whitespace-nowrap">
                          {item.price}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      {itemIndex < pkg.items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Racket Rental */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-16"
        >
          <Card className="bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-forest" />
                {racketRental.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {racketRental.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="w-2 h-2 bg-forest rounded-full" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;

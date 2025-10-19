"use client";

import { motion } from "framer-motion";
import { Clock, Trophy, Info, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { PricingContent } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const Pricing = ({ content }: { content: PricingContent }) => {
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
              {content.badge}
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="heading-2 mb-4">
            {content.heading}
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-body max-w-2xl mx-auto">
            {content.description}
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
              {content.notes.map((note, index) => (
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
          {/* Court Rental Section */}
          <div>
            {/* Peak Hours */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-forest/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="heading-3 text-foreground">
                    {content.courtRental.peakHours.title}
                  </h3>
                  {content.courtRental.peakHours.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {content.courtRental.peakHours.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {content.courtRental.peakHours.items.map((item, itemIndex) => (
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
                          IDR {item.price}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Off-Peak Hours */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-forest/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="heading-3 text-foreground">
                    {content.courtRental.offPeakHours.title}
                  </h3>
                  {content.courtRental.offPeakHours.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {content.courtRental.offPeakHours.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.courtRental.offPeakHours.items.map((item, itemIndex) => (
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
                          IDR {item.price}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator className="mt-12" />
          </div>

          {/* Head Coach Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-forest/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="heading-3 text-foreground">
                    {content.headCoach.title}
                  </h3>
                  {content.headCoach.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {content.headCoach.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.headCoach.items.map((item, itemIndex) => (
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
                          IDR {item.price}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator className="mt-12" />
          </div>

          {/* Coaching Packages - Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Senior Coach */}
            <div>
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
                  <div>
                    <h3 className="heading-3 text-foreground">
                      {content.seniorCoach.title}
                    </h3>
                    {content.seniorCoach.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {content.seniorCoach.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              <Card className="border-forest/20 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  {content.seniorCoach.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {item.name}
                          </h4>
                        </div>
                        <div className="font-bold text-xl text-forest whitespace-nowrap">
                          IDR {item.price}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      {itemIndex < content.seniorCoach.items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Junior Coach */}
            <div>
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
                  <div>
                    <h3 className="heading-3 text-foreground">
                      {content.juniorCoach.title}
                    </h3>
                    {content.juniorCoach.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {content.juniorCoach.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              <Card className="border-forest/20 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  {content.juniorCoach.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {item.name}
                          </h4>
                        </div>
                        <div className="font-bold text-xl text-forest whitespace-nowrap">
                          IDR {item.price}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      {itemIndex < content.juniorCoach.items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
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
                  {content.racketRental.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {content.racketRental.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-forest rounded-full" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        IDR {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

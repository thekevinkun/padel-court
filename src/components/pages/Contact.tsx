"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { fadeInUp, slideInLeft, slideInRight, staggerContainer } from "@/lib/animations";

const Contact = () => {
  const { settings, loading } = useSettings();

  // Fallback while loading
  if (loading || !settings) {
    return (
      <section className="section-py bg-background">
        <div className="container-custom">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Extract Google Maps embed URL from google_maps_url
  const getEmbedUrl = (url: string) => {
    // Convert regular Google Maps URL to embed URL
    if (url.includes("google.com/maps")) {
      // Extract query or location from URL
      const match = url.match(/q=([^&]+)/);
      if (match) {
        return `https://maps.google.com/maps?q=${match[1]}&output=embed`;
      }
    }
    // If already embed URL or fallback
    return url.includes("output=embed") ? url : `${url}&output=embed`;
  };

  const embedUrl = settings.google_maps_url
    ? getEmbedUrl(settings.google_maps_url)
    : "";

  return (
    <section className="section-py relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl -z-10" />

      <div className="max-lg:mx-auto max-lg:max-w-7xl max-lg:px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          {/* LEFT: Contact CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="order-2 lg:order-1 lg:px-3 lg:w-full lg:max-w-2xl lg:mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-4">
              <Badge className="bg-forest/10 text-forest border-forest/20 text-sm md:text-base font-medium px-4 py-2">
                <MessageCircle className="w-4 h-4 mr-2 inline" />
                Visit Us Today
              </Badge>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="heading-2 text-foreground mb-6"
            >
              Get In Touch With Us
            </motion.h2>

            {/* Left Card with Call to Action */}
            <motion.div variants={slideInLeft}>
              <Card className="bg-gradient-to-br from-forest/5 to-primary/5 border-forest/20 shadow-xl">
                <CardContent className="p-8 md:p-10">
                  <h3 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-3">
                    Have Questions?
                  </h3>
                  <p className="text-lg md:text-xl text-foreground/80 font-medium mb-6">
                    Contact or Visit Us Today
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto rounded-full font-semibold hover:scale-105 transition-transform gap-2"
                  >
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* RIGHT: Map + Contact Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="order-1 lg:order-2 space-y-6"
          >
            {/* Google Map Embed */}
            {embedUrl && (
              <motion.div variants={slideInRight}>
                <Card className="overflow-hidden shadow-2xl border-0 rounded-none sm:rounded-xl">
                  <CardContent className="p-0">
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="480"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                      title="Padel Location Map"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Contact Details */}
            <motion.div variants={fadeInUp} className="w-full lg:max-w-2xl lg:pr-3 lg:mr-auto">
              <Card className="shadow-xl border-border/50">
                <CardContent className="p-6 md:p-8 space-y-5">
                  {/* Location Name */}
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold font-display text-foreground mb-4">
                      {settings.business_name}
                    </h3>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-forest" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase mb-1">
                        Phone
                      </p>
                      <a
                        href={`tel:${settings.phone}`}
                        className="text-foreground hover:text-forest transition-colors font-medium"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-forest" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-foreground hover:text-forest transition-colors font-medium break-all"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-forest" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase mb-1">
                        Address
                      </p>
                      <p className="text-foreground font-medium leading-relaxed">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
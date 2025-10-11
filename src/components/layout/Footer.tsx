"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { footerData } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
};

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* CTA Section - Overlapping */}
      <div className="relative">
        <div className="container-custom">
          <Card className="relative -top-16 bg-background shadow-2xl border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-forest/5" />
            <div className="relative px-6 py-8 md:px-12 md:py-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="heading-3 text-foreground mb-2">
                    {footerData.cta.title}
                  </h3>
                  <p className="text-body">{footerData.cta.description}</p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full font-semibold hover:scale-105 hover:text-accent-foreground transition-transform group shrink-0"
                >
                  <Link href="#booking">
                    BOOK NOW
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Footer Content - Extra padding top for CTA overlap */}
      <div className="container-custom pt-8 pb-12 md:pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {/* Brand Section */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-primary/20 p-2 rounded-lg border border-primary/30">
                    <svg
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                        fill="#E9FF00"
                        stroke="#E9FF00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="font-display font-bold text-base leading-tight">
                  <div className="text-white">PADEL</div>
                  <div className="text-xs text-gray-400">BATU ALAM PERMAI</div>
                </div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6">{footerData.tagline}</p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={`mailto:${footerData.contact.email}`}
                className="flex items-start gap-3 text-sm text-gray-400 hover:text-primary transition-colors group"
              >
                <Mail className="w-4 h-4 mt-0.5 shrink-0 group-hover:text-primary" />
                <span>{footerData.contact.email}</span>
              </a>
              <a
                href={`tel:${footerData.contact.phone}`}
                className="flex items-start gap-3 text-sm text-gray-400 hover:text-primary transition-colors group"
              >
                <Phone className="w-4 h-4 mt-0.5 shrink-0 group-hover:text-primary" />
                <span>{footerData.contact.phone}</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{footerData.contact.address}</span>
              </div>
            </div>
          </motion.div>

          {/* Useful Links */}
          <motion.div variants={fadeInUp}>
            <h4 className="font-display font-bold text-primary text-lg mb-4">
              Useful Links
            </h4>
            <ul className="space-y-2.5">
              {footerData.links.useful.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-forest rounded-full group-hover:bg-primary transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal & Social */}
          <motion.div variants={fadeInUp}>
            <h4 className="font-display font-bold text-primary text-lg mb-4">
              Follow Us
            </h4>
            <div className="flex gap-3 mb-6">
              {footerData.social.map((social) => {
                const Icon =
                  socialIcons[social.icon as keyof typeof socialIcons];
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary/10 hover:bg-primary rounded-lg flex items-center justify-center transition-all hover:scale-110 group"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5 text-primary group-hover:text-black transition-colors" />
                  </a>
                );
              })}
            </div>

            <h4 className="font-display font-semibold text-white text-sm mb-3 mt-8">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {footerData.links.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Open Hours */}
          <motion.div variants={fadeInUp}>
            <h4 className="font-display font-bold text-primary text-lg mb-4">
              {footerData.hours.title}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm mb-1">
                    {footerData.hours.schedule}
                  </p>
                  <p className="text-xs text-gray-400">
                    {footerData.hours.note}
                  </p>
                </div>
              </div>

              <Button
                asChild
                size="sm"
                className="font-semibold rounded-full w-full mt-4"
              >
                <Link href="#booking">CHECK AVAILABILITY</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <Separator className="my-8 bg-gray-800" />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-500"
        >
          {footerData.copyright}
        </motion.div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${footerData.contact.whatsapp.replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform group"
        aria-label="Contact us on WhatsApp"
      >
        <svg
          className="w-7 h-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </footer>
  );
};

export default Footer;

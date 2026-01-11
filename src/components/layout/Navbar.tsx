"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useBooking } from "@/contexts/BookingContext";
import { navLinks } from "@/lib/constants";
import { backdropVariants } from "@/lib/animations";

const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false }
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Get booking functions from context
  const { openBooking } = useBooking();

  // Change navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth background color transition
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0)", "rgba(233, 255, 0, 0.98)"]
  );

  // Close menu on escape key or outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleBookNowClick = () => {
    closeMobileMenu();
    openBooking();
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          backgroundColor,
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg md:backdrop-blur-[10px]" : ""
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-black p-2 rounded-lg">
                  <svg
                    className={`transition-all duration-300 delay-100 ${
                      isScrolled
                        ? "w-10 h-10 md:w-12 md:h-12"
                        : "w-8 h-8 md:w-10 md:h-10"
                    }`}
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
              </motion.div>
              <div
                className={`logo text-sm md:text-base leading-tight transition-all duration-300 delay-100 ${
                  isScrolled
                    ? "text-accent-foreground text-lg md:text-xl"
                    : "text-accent"
                }`}
              >
                <div>PADEL</div>
                <div className="text-xs md:text-sm">BATU ALAM PERMAI</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className={`relative font-medium text-sm xl:text-base transition-colors group ${
                      isScrolled
                        ? "text-accent-foreground hover:text-muted-foreground"
                        : "text-accent hover:text-primary"
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                        isScrolled ? "bg-black" : "bg-primary"
                      }`}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA Button - Desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="hidden lg:block"
            >
              <Button
                onClick={openBooking}
                size="lg"
                className={`rounded-full font-semibold hover:scale-105 hover:!text-accent transition-transform ${
                  isScrolled && "hover:!text-accent-foreground"
                }`}
              >
                BOOK NOW
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            {!isMobileMenuOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className={`lg:hidden transition-all ${
                  isScrolled
                    ? "text-accent-foreground hover:bg-black/10"
                    : "text-accent hover:bg-white/10"
                }`}
              >
                <Menu className="!w-6 !h-6" />
              </Button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu - Full Screen Sidebar */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeMobileMenu}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              style={{ backdropFilter: "blur(4px)" }}
            />

            {/* Sidebar Menu */}
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed left-0 top-0 h-dvh w-4/5 max-w-sm z-50 bg-primary lg:hidden flex flex-col overflow-y-auto scrollbar-hide"
            >
              {/* Header with Logo and Close Button */}
              <motion.div
                className="flex items-center justify-between p-6 border-b border-foreground/20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/"
                  className="flex items-center gap-3 group"
                  onClick={closeMobileMenu}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-foreground rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-black p-2 rounded-lg">
                      <svg
                        className="w-6 h-6"
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
                  </motion.div>
                  <div className="logo text-base leading-tight">
                    <div>PADEL</div>
                    <div className="text-sm">BATU ALAM PERMAI</div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMobileMenu}
                  className="text-foreground hover:bg-foreground/10 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </motion.div>

              {/* Nav Links */}
              <div className="flex-1 flex flex-col justify-center items-center gap-5 p-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className="w-full max-w-xs"
                  >
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="block py-4 text-2xl font-display font-semibold text-foreground text-center hover:text-accent-foreground transition-colors group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute inset-0 bg-foreground/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button - Mobile */}
              <motion.div
                className="p-6 border-t border-foreground/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Button
                  onClick={handleBookNowClick}
                  size="lg"
                  className="w-full rounded-full font-semibold text-foreground hover:scale-105 transition-transform"
                >
                  BOOK NOW
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

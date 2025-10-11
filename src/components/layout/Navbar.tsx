"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { fadeInDown, drawerVariants, backdropVariants } from "@/lib/animations";
import { navLinks } from "@/lib/constants";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

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

  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(10px)"]
  );

  // Close menu on escape key or outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent body scroll
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <motion.nav
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        style={{
          backgroundColor,
          backdropFilter: backdropBlur,
          WebkitBackdropFilter: backdropBlur,
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg" : ""
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
                    className={`transition-all ${
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
                className={`logo text-sm md:text-base leading-tight transition-all ${
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
                  transition={{ delay: 0.1 * index }}
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

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="hidden lg:block"
            >
              <Button
                asChild
                size="lg"
                className={`rounded-full font-semibold hover:scale-105 transition-transform ${
                  isScrolled && "hover:!text-accent-foreground"
                }`}
              >
                <Link href="#booking">BOOK NOW</Link>
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
                <Menu className="!w-6 !h-6"/>
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
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-0 top-0 h-screen w-4/5 max-w-sm z-50 bg-primary lg:hidden flex flex-col overflow-y-auto scrollbar-hide"
            >
              {/* Header with Logo and Close Button */}
              <motion.div
                className="flex items-center justify-between p-6 border-b border-foreground/20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
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
              <div className="flex-1 flex flex-col justify-center items-center gap-8 p-6">
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

              {/* CTA Button */}
              <motion.div
                className="p-6 border-t border-foreground/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full font-semibold text-foreground hover:scale-105 transition-transform"
                >
                  <Link href="#booking" onClick={closeMobileMenu}>
                    BOOK NOW
                  </Link>
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

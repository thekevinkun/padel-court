"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Parallax } from "react-scroll-parallax";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { TestimonialsContent } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface TestimonialsProps {
  content: TestimonialsContent;
}

const Testimonials = ({ content }: TestimonialsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-slide testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev === content.testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? content.testimonials.length - 1 : prev - 1
    );
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentTestimonial = content.testimonials[currentIndex];

  // Animation variants for testimonial cards
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="relative lg:pt-32 md:pt-36 pt-0">
      {/* Background Image with Dark Overlay */}
      <Parallax speed={-30} className="absolute inset-0 z-[-999]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${content.backgroundImage}')`,
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </Parallax>

      {/* Content Container */}
      <div className="relative z-10">
        <div className="container-custom">
          {/* Video Floating Box - Hidden on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden md:block absolute top-[-200px] inset-0 max-w-5xl mx-auto px-6 lg:px-3 z-50"
          >
            <div className="relative aspect-video overflow-hidden shadow-2xl">
              {/* Placeholder Image (will be video later) */}
              {/* <img
                src={content.videoUrl}
                alt="Padel court showcase"
                className="w-full h-full object-cover"
              /> */}

              {/* Video - Lower quality OK for background */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                preload="metadata" // Optimize video loading
              >
                <source src={content.videoUrl} type="video/mp4" />
              </video>
            </div>
          </motion.div>

          <div className="section-py overflow-hidden">
            {/* Section Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="text-center lg:mt-[22rem] md:mt-80 mb-12 md:mb-16"
            >
              <motion.div variants={fadeInUp} className="mb-4">
                <Badge className="bg-forest/10 text-forest border-forest/20 lg:text-base font-medium px-4 py-2">
                  {content.badge}
                </Badge>
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="heading-2 mb-4 text-white"
              >
                {content.heading}
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-body !text-gray-300 mx-auto"
              >
                {content.description}
              </motion.p>
            </motion.div>

            {/* Testimonials Slider */}
            <div className="max-w-4xl mx-auto">
              <div className="relative min-h-[350px] md:min-h-[300px] flex items-center">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="w-full"
                  >
                    {/* Testimonial Card */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
                      {/* Quote Icon */}
                      <div className="mb-6">
                        <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
                          <Quote className="w-7 h-7 text-primary" />
                        </div>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < currentTestimonial.rating
                                ? "fill-primary text-primary"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-xl md:text-2xl leading-relaxed mb-8 text-white font-light italic">
                        "{currentTestimonial.comment}"
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-4">
                        {currentTestimonial.avatar ? (
                          <img
                            src={currentTestimonial.avatar}
                            alt={currentTestimonial.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                            <span className="text-primary font-bold text-xl">
                              {currentTestimonial.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white text-lg">
                            {currentTestimonial.name}
                          </div>
                          {currentTestimonial.role && (
                            <div className="text-sm text-gray-400">
                              {currentTestimonial.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-4 md:gap-6 mt-10">
                {/* Prev Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-12 w-12"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {content.testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === currentIndex
                          ? "w-10 bg-primary"
                          : "w-2.5 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-12 w-12"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mt-8 h-1 bg-white/10 rounded-full overflow-hidden max-w-sm mx-auto">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  key={currentIndex}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

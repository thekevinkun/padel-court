"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { GalleryImage } from "@/types";
import { ImagePresets } from "@/lib/supabase/image-transform";

interface GalleryLightboxProps {
  images: GalleryImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex: number;
}

const GalleryLightbox = ({
  images,
  open,
  onOpenChange,
  initialIndex,
}: GalleryLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  // Auto-scroll thumbnails
  useEffect(() => {
    if (!thumbnailContainerRef.current) return;

    const container = thumbnailContainerRef.current;
    const thumbnails = container.querySelectorAll("button");
    const activeThumbnail = thumbnails[currentIndex];

    if (activeThumbnail) {
      // Scroll the active thumbnail into view (centered)
      activeThumbnail.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDownload = async () => {
    const image = images[currentIndex];
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `padel-gallery-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[100vh] md:h-[90vh] p-0 bg-gradient-to-br from-black via-gray-900 to-black border-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{currentImage.caption}</DialogTitle>
          <DialogDescription className="sr-only">
            {currentImage.alt}
          </DialogDescription>
        </DialogHeader>

        {/* Top Bar - Download & Close Buttons */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            {/* Counter on the left */}
            <span className="text-white/80 text-sm font-medium px-3 py-1.5 bg-black/30 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          <div className="mr-12">
            {/* Download Button */}
            <Button
              onClick={handleDownload}
              size="icon"
              variant="ghost"
              className="rounded-full bg-black/50 hover:bg-forest-dark !text-white backdrop-blur-sm"
              aria-label="Download image"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-primary/70 hover:bg-primary transition-colors shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 text-black" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-primary/70 hover:bg-primary transition-colors shadow-lg"
            >
              <ChevronRight className="w-6 h-6 text-black" />
            </button>
          </>
        )}

        {/* Main Image Container - Fixed height to leave room for thumbnails */}
        <div className="relative w-full h-[calc(100%-180px)] flex items-center justify-center px-4 pt-16 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={ImagePresets.galleryFull(currentImage.url)}
                alt={currentImage.alt}
                quality={90}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Section - Caption & Thumbnails */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/90 to-transparent">
          {/* Caption */}
          {currentImage.caption && (
            <div className="px-6 pt-6 pb-3">
              <p className="text-accent font-medium text-center max-w-3xl mx-auto">
                {currentImage.caption}
              </p>
            </div>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="px-4 pb-4">
              <div className="max-w-4xl mx-auto">
                <div 
                  ref={thumbnailContainerRef}
                  className="flex gap-2 py-2 overflow-x-auto [&::-webkit-scrollbar]:h-2 
                    [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary 
                    [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 
                    [&::-webkit-scrollbar-thumb]:border-transparent"
                >
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`View image ${index + 1}`}
                      className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${
                        index === currentIndex
                          ? "ring-2 ring-primary scale-105"
                          : "opacity-50 hover:opacity-100 hover:scale-105"
                      } ${index === 0 ? "ml-2" : ""} ${index === images.length - 1 ? "mr-2": ""}`}
                    >
                      <Image
                        src={ImagePresets.galleryThumb(image.url)}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="80px"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;

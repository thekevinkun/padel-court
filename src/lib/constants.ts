import { Trophy, Zap, Target } from "lucide-react";
import { Feature } from "@/types/image";

export const BUSINESS_NAME = "Padel Batu Alam Permai";
export const BUSINESS_EMAIL = "info@padelbatualampermai.com";
export const BUSINESS_PHONE = "+1234567890";

export const BOOKING_DURATION_OPTIONS = [
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export const OPERATING_HOURS = {
  start: "08:00",
  end: "22:00",
  interval: 60, // minutes
};

export const navLinks = [
  { name: "Activities", href: "#activities" },
  { name: "Shop", href: "#shop" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

export const features: Feature[] = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
    alt: "Professional padel court at Batu Alam Permai",
  },
  {
    type: "text",
    icon: Trophy,
    title: "Competitive Tournaments & Events",
    description:
      "Join our vibrant community with weekly tournaments, seasonal championships, and social mixers. Whether you're competing for glory or playing for fun, there's always an exciting match waiting for you at Padel Batu Alam Permai.",
    bgImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000",
    alt: "Players enjoying padel match",
  },
  {
    type: "text",
    icon: Zap,
    title: "Dynamic Play for All Skill Levels",
    description:
      "From complete beginners to advanced competitors, our courts welcome everyone. Join casual drop-in sessions, organize private matches, or challenge yourself in our skill-based leagues. The padel lifestyle starts here.",
    bgImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000",
    alt: "Padel court facilities and amenities",
  },
  {
    type: "text",
    icon: Target,
    title: "European Standard Excellence",
    description:
      "Experience the finest padel courts in Indonesia, built to international specifications with premium Italian glass walls and professional-grade turf. Every detail is crafted to deliver the authentic European padel experience right here in Bali.",
    bgImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
  },
];
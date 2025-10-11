import { Trophy, Zap, Target } from "lucide-react";
import { Feature, PricingSection, CoachingPackage } from "@/types/home";

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
    bgImage:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
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
    bgImage:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
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
    bgImage:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
  },
];

export const pricingNotes = [
  "If fewer than 4 people are playing, the full court cost must still be covered (4 people).",
  "Payment is due at the reception before you begin your match.",
  "All prices are per person unless stated otherwise.",
];

export const pricingSections: PricingSection[] = [
  {
    id: "peak-hours",
    title: "Peak Hours Court Rental",
    subtitle: "(6AM - 10AM / 3PM - 10PM)",
    items: [
      {
        name: "Court Rental Peak 60min",
        price: "IDR 100,000",
        description: "Price is per person",
      },
      {
        name: "Court Rental Peak 90min",
        price: "IDR 150,000",
        description: "Price is per person",
      },
    ],
  },
  {
    id: "off-peak-hours",
    title: "Off-Peak Hours Court Rental",
    subtitle: "(10AM - 3PM)",
    items: [
      {
        name: "Court Rental Off-Peak 60min",
        price: "IDR 60,000",
        description: "Price is per person",
      },
      {
        name: "Court Rental Off-Peak 90min",
        price: "IDR 90,000",
        description: "Price is per person",
      },
    ],
  },
  {
    id: "head-coach",
    title: "Head Coach Private Lessons",
    subtitle: "1 Hour Lesson, includes court, racket, balls and equipment",
    items: [
      {
        name: "1 Person",
        price: "IDR 900,000",
        description: "Price per person",
      },
      {
        name: "2 Persons",
        price: "IDR 500,000",
        description: "Price per person",
      },
      {
        name: "3 Persons",
        price: "IDR 400,000",
        description: "Price per person",
      },
      {
        name: "4 Persons",
        price: "IDR 300,000",
        description: "Price per person",
      },
    ],
  },
];

export const coachingPackages: CoachingPackage[] = [
  {
    title: "Senior Coach Lessons",
    items: [
      {
        name: "1 Person",
        price: "IDR 750,000",
        description:
          "1 Hour Lesson, includes court, racket, balls and equipment",
      },
      {
        name: "2 Persons",
        price: "IDR 400,000",
        description:
          "Per person - 1 Hour Lesson, includes court, racket, balls and equipment",
      },
      {
        name: "3 Persons",
        price: "IDR 300,000",
        description:
          "Per person - 1 Hour Lesson, includes court, racket, balls and equipment",
      },
      {
        name: "4 Persons",
        price: "IDR 225,000",
        description:
          "Per person - 1 Hour Lesson, includes court, racket, balls and equipment",
      },
    ],
  },
  {
    title: "Junior Coach Lessons",
    items: [
      {
        name: "1 Person",
        price: "IDR 700,000",
        description:
          "1 Hour Lesson, includes court, racket, balls and equipment",
      },
      {
        name: "2 Persons",
        price: "IDR 350,000",
        description:
          "Per person - 1 Hour Lesson, includes court, racket, balls and equipment",
      },
      {
        name: "3 Persons",
        price: "IDR 250,000",
        description:
          "Per person - 1 Hour Lesson, includes court, racket, balls and equipment",
      },
      {
        name: "4 Persons",
        price: "IDR 200,000",
        description:
          "Per person - 1 Hour Lesson, includes court, racket, balls and equipment",
      },
    ],
  },
];

export const racketRental = {
  title: "Rackets can be rented:",
  items: [
    "Standard: IDR 30,000 / per racket / per session",
    "Premium: IDR 60,000 / per racket / per session",
  ],
};

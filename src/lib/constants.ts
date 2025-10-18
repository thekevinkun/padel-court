import { Trophy, Zap, Target } from "lucide-react";
import { Court, TimeSlot } from "@/types";
import { Feature, PricingSection, CoachingPackage } from "@/types/home";

export const BUSINESS_NAME = "Padel Batu Alam Permai";
export const BUSINESS_ADDRESS =
  "Komp. Batu Alam Permai, Samarinda, East Kalimantan";
export const BUSINESS_EMAIL = "info@padelbatualampermai.com";
export const BUSINESS_PHONE = "+62 812 3456 7890";

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
    src: "/images/feature-1.jpg",
    alt: "Professional padel court at Batu Alam Permai",
  },
  {
    type: "text",
    icon: Trophy,
    title: "Competitive Tournaments & Events",
    description:
      "Join our vibrant community with weekly tournaments, seasonal championships, and social mixers. Whether you're competing for glory or playing for fun, there's always an exciting match waiting for you at Padel Batu Alam Permai.",
    bgImage:
      "/images/feature-highlight.jpg",
  },
  {
    type: "image",
    src: "/images/feature-2.jpg",
    alt: "Players enjoying padel match",
  },
  {
    type: "text",
    icon: Zap,
    title: "Dynamic Play for All Skill Levels",
    description:
      "From complete beginners to advanced competitors, our courts welcome everyone. Join casual drop-in sessions, organize private matches, or challenge yourself in our skill-based leagues. The padel lifestyle starts here.",
    bgImage:
      "/images/feature-highlight.jpg",
  },
  {
    type: "image",
    src: "/images/feature-3.jpg",
    alt: "Padel court facilities and amenities",
  },
  {
    type: "text",
    icon: Target,
    title: "European Standard Excellence",
    description:
      "Experience the finest padel courts in Indonesia, built to international specifications with premium Italian glass walls and professional-grade turf. Every detail is crafted to deliver the authentic European padel experience right here in Bali.",
    bgImage:
      "/images/feature-highlight.jpg",
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

export const footerData = {
  tagline: "Experience the thrill of Padel at our world class padel courts",

  contact: {
    address: BUSINESS_ADDRESS,
    email: BUSINESS_EMAIL,
    phone: BUSINESS_PHONE,
    whatsapp: BUSINESS_PHONE,
  },

  social: [
    {
      name: "Facebook",
      url: "https://facebook.com",
      icon: "facebook",
    },
    {
      name: "Instagram",
      url: "https://instagram.com",
      icon: "instagram",
    },
    {
      name: "Twitter",
      url: "https://twitter.com",
      icon: "twitter",
    },
  ],

  links: {
    useful: [
      { name: "Live Weather", href: "#weather" },
      { name: "Activities", href: "#activities" },
      { name: "Shop", href: "#shop" },
      { name: "Pricing", href: "#pricing" },
      { name: "Contact", href: "#contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cancellation Policy", href: "#cancellation" },
    ],
  },

  hours: {
    title: "Open Hours",
    schedule: "6 AM - 11 PM, Monday - Sunday",
    note: "Click below to see current court availability and activities",
  },

  cta: {
    title: "Play Padel Today",
    description:
      "Experience the thrill of Padel at our world class padel courts",
  },

  copyright: `© ${new Date().getFullYear()} Padel Batu Alam Permai. All rights reserved.`,
};

export const courts: Court[] = [
  {
    id: "court-1",
    name: "Court 1 - Paradise",
    description: "Premium glass court with tropical view",
    available: true,
  },
  {
    id: "court-2",
    name: "Court 2 - Sunset",
    description: "Perfect for evening matches",
    available: true,
  },
  {
    id: "court-3",
    name: "Court 3 - Jungle",
    description: "Surrounded by lush greenery",
    available: true,
  },
  {
    id: "court-4",
    name: "Court 4 - Ocean",
    description: "With refreshing ocean breeze",
    available: false,
  },
];

export const timeSlots: TimeSlot[] = [
  // Morning Peak
  {
    id: "slot-1",
    time: "06:00 - 07:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-2",
    time: "07:00 - 08:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-3",
    time: "08:00 - 09:00",
    available: false,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-4",
    time: "09:00 - 10:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },

  // Off-Peak
  {
    id: "slot-5",
    time: "10:00 - 11:00",
    available: true,
    period: "off-peak",
    pricePerPerson: 60000,
  },
  {
    id: "slot-6",
    time: "11:00 - 12:00",
    available: true,
    period: "off-peak",
    pricePerPerson: 60000,
  },
  {
    id: "slot-7",
    time: "12:00 - 13:00",
    available: true,
    period: "off-peak",
    pricePerPerson: 60000,
  },
  {
    id: "slot-8",
    time: "13:00 - 14:00",
    available: true,
    period: "off-peak",
    pricePerPerson: 60000,
  },
  {
    id: "slot-9",
    time: "14:00 - 15:00",
    available: true,
    period: "off-peak",
    pricePerPerson: 60000,
  },

  // Afternoon/Evening Peak
  {
    id: "slot-10",
    time: "15:00 - 16:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-11",
    time: "16:00 - 17:00",
    available: false,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-12",
    time: "17:00 - 18:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-13",
    time: "18:00 - 19:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-14",
    time: "19:00 - 20:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-15",
    time: "20:00 - 21:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },
  {
    id: "slot-16",
    time: "21:00 - 22:00",
    available: true,
    period: "peak",
    pricePerPerson: 100000,
  },
];

export const paymentMethods = [
  { id: "bank-transfer", name: "Bank Transfer", fee: 0 },
  { id: "credit-card", name: "Credit/Debit Card", fee: 2500 },
  { id: "e-wallet", name: "E-Wallet (GoPay, OVO, DANA)", fee: 1500 },
  { id: "qris", name: "QRIS", fee: 0 },
];

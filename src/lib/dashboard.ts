import {
  LayoutDashboard,
  Calendar,
  Building2,
  Clock,
  FileText,
  Settings,
} from "lucide-react";
import { Feature, Pricing } from "@/types";

export const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Courts", href: "/admin/courts", icon: Building2 },
  { name: "Time Slots", href: "/admin/time-slots", icon: Clock },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bookings": "Bookings Management",
  "/admin/courts": "Courts Management",
  "/admin/time-slots": "Time Slots Management",
  "/admin/content": "Content Management",
  "/admin/settings": "Settings",
};

export const heroInitial = {
  badge: "#1 Padel Club in Batu Alam Permai",
  title: "Your Premium Padel Experience Starts Here",
  subtitle:
    "World-class courts. Professional coaching. Seamless booking. Everything you need for the perfect game.",
  ctaPrimary: { text: "BOOK NOW", href: "/#booking" },
  ctaSecondary: { text: "VIEW PRICING", href: "/#pricing" },
  image_url: "/images/hero.png",
  stats: [
    { number: "4+", label: "Premium Courts" },
    { number: "500+", label: "Happy Players" },
    { number: "24/7", label: "Online Booking" },
  ],
};

export const welcomeInitial = {
  badge: "WELCOME TO PADEL BATU ALAM PERMAI",
  heading: "Where Premium Courts Meet Paradise Setting",
  description:
    "Discover Indonesia's Samarinda finest padel destination nestled in the heart of Batu Alam Permai. Our state-of-the-art facilities blend world-class infrastructure with natural tropical beauty, creating an unmatched playing experience for enthusiasts of all levels.",
  images: [
    "/images/welcome-1.jpg",
    "/images/welcome-2.jpg",
    "/images/welcome-3.jpg",
    "/images/welcome-4.jpg",
  ],
  features: [
    {
      icon: "Users",
      title: "Professional Coaching",
      desc: "Expert trainers available",
    },
    { icon: "Clock", title: "Flexible Hours", desc: "Open daily 6 AM - 11 PM" },
  ],
  cta: { text: "RESERVE YOUR COURT", href: "/#booking" },
};

export const featuresInitial: Feature[] = [
  {
    id: "f1",
    type: "image",
    src: "/images/feature-1.jpg",
    alt: "Professional padel court at Batu Alam Permai",
  },
  {
    id: "f2",
    type: "text",
    bgImage: "/images/feature-highlight.jpg",
    icon: "Trophy",
    title: "Competitive Tournaments & Events",
    description:
      "Join our vibrant community with weekly tournaments, seasonal championships, and social mixers. Whether you're competing for glory or playing for fun, there's always an exciting match waiting for you at Padel Batu Alam Permai.",
  },
  {
    id: "f3",
    type: "image",
    src: "/images/feature-2.jpg",
    alt: "Players enjoying padel match",
  },
  {
    id: "f4",
    type: "text",
    bgImage: "/images/feature-highlight.jpg",
    icon: "Zap",
    title: "Dynamic Play for All Skill Levels",
    description:
      "From complete beginners to advanced competitors, our courts welcome everyone. Join casual drop-in sessions, organize private matches, or challenge yourself in our skill-based leagues. The padel lifestyle starts here.",
  },
  {
    id: "f5",
    type: "image",
    src: "/images/feature-3.jpg",
    alt: "Padel court facilities and amenities",
  },
  {
    id: "f6",
    type: "text",
    bgImage: "/images/feature-highlight.jpg",
    icon: "Target",
    title: "European Standard Excellence",
    description:
      "Experience the finest padel courts in Indonesia, built to international specifications with premium Italian glass walls and professional-grade turf. Every detail is crafted to deliver the authentic European padel experience right here in Bali.",
  },
];

// Pricing Structure
export const pricingInitial: Pricing = {
  badge: "Our Pricing List",
  heading: "Simple, Clear Pricing Plans",
  description:
    "Choose the perfect option for your padel experience at Batu Alam Permai",
  notes: [
    "If fewer than 4 people are playing, the full court cost must still be covered (4 people).",
    "Payment is due at the reception before you begin your match.",
    "All prices are per person unless stated otherwise.",
  ],
  courtRental: {
    peakHours: {
      title: "Peak Hours Court Rental",
      subtitle: "(6AM - 10AM / 3PM - 10PM)",
      items: [
        {
          name: "60 Minutes",
          price: "100,000",
          description: "Price per person",
        },
        {
          name: "90 Minutes",
          price: "150,000",
          description: "Price per person",
        },
      ],
    },
    offPeakHours: {
      title: "Off-Peak Hours Court Rental",
      subtitle: "(10AM - 3PM)",
      items: [
        {
          name: "60 Minutes",
          price: "60,000",
          description: "Price per person",
        },
        {
          name: "90 Minutes",
          price: "90,000",
          description: "Price per person",
        },
      ],
    },
  },
  headCoach: {
    title: "Head Coach Private Lessons",
    subtitle: "1 Hour Lesson, includes court, racket, balls and equipment",
    items: [
      { name: "1 Person", price: "900,000", description: "Price per person" },
      { name: "2 Persons", price: "500,000", description: "Price per person" },
      { name: "3 Persons", price: "400,000", description: "Price per person" },
      { name: "4 Persons", price: "300,000", description: "Price per person" },
    ],
  },
  seniorCoach: {
    title: "Senior Coach Lessons",
    subtitle: "1 Hour Lesson, includes court, racket, balls and equipment",
    items: [
      { name: "1 Person", price: "750,000", description: "Price per person" },
      { name: "2 Persons", price: "400,000", description: "Price per person" },
      { name: "3 Persons", price: "300,000", description: "Price per person" },
      { name: "4 Persons", price: "225,000", description: "Price per person" },
    ],
  },
  juniorCoach: {
    title: "Junior Coach Lessons",
    subtitle: "1 Hour Lesson, includes court, racket, balls and equipment",
    items: [
      { name: "1 Person", price: "700,000", description: "Price per person" },
      { name: "2 Persons", price: "350,000", description: "Price per person" },
      { name: "3 Persons", price: "250,000", description: "Price per person" },
      { name: "4 Persons", price: "200,000", description: "Price per person" },
    ],
  },
  racketRental: {
    title: "Racket Rental",
    items: [
      { name: "Standard Racket", price: "30,000", description: "Per session" },
      { name: "Premium Racket", price: "60,000", description: "Per session" },
    ],
  },
};

// Initial settings data
export const initialSettings = {
  // Business Info
  businessName: "Padel Batu Alam Permai",
  businessDescription:
    "Premium padel club in Samarinda, Indonesia. World-class courts, professional coaching, and seamless booking experience.",
  logo: "/images/logo.png",

  // Contact Information
  email: "info@padelbap.com",
  phone: "+62 812 3456 7890",
  whatsapp: "+62 812 3456 7890",
  address: "Batu Alam Permai, Samarinda, East Kalimantan, Indonesia",
  googleMapsUrl: "https://maps.google.com/?q=Batu+Alam+Permai+Samarinda",

  // Operating Hours
  operatingHours: {
    weekday: { open: "06:00", close: "23:00" },
    weekend: { open: "06:00", close: "23:00" },
  },

  // Social Media
  socialMedia: {
    facebook: "https://facebook.com/padelbap",
    instagram: "https://instagram.com/padelbap",
    whatsappCommunity: "https://chat.whatsapp.com/xxxxx",
  },

  // Booking Settings
  bookingSettings: {
    minAdvanceBooking: 1, // hours
    maxAdvanceBooking: 30, // days
    cancellationWindow: 24, // hours
    requireDeposit: true,
    depositPercentage: 50,
  },

  // Payment Settings
  paymentSettings: {
    midtransClientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    midtransIsProduction: false,
    enableCreditCard: true,
    enableBankTransfer: true,
    enableEWallet: true,
    enableQRIS: true,
  },

  // Notification Settings
  notificationSettings: {
    emailNotifications: true,
    whatsappNotifications: true,
    bookingConfirmation: true,
    paymentReminder: true,
    bookingReminder: true,
  },

  // SEO & Meta
  seo: {
    metaTitle: "Padel Batu Alam Permai - Premium Padel Courts in Samarinda",
    metaDescription:
      "Book premium padel courts in Samarinda. Professional coaching, world-class facilities, and seamless online booking.",
    metaKeywords: "padel, samarinda, padel court, sports, booking, batu alam",
    ogImage: "/images/og-image.jpg",
  },
};
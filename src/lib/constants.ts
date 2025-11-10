import { FeatureItem, PricingContent } from "@/types";

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

export const featuresInitial: FeatureItem[] = [
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
export const pricingInitial: PricingContent = {
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

export const footerData = {
  businessName: "Padel Batu Alam Permai",
  tagline: "Premium padel courts in Batu Alam Permai. Book your court online with instant confirmation.",
  email: "info@padelbap.com",
  phone: "+62 812 3456 7890",
  whatsapp: "+62 812 3456 7890",
  address: "Jl. Batu Alam Permai No. 123, Samarinda, Kalimantan Timur 75117",
  operatingHours: {
    weekday: { open: "06:00", close: "23:00" },
    weekend: { open: "06:00", close: "23:00" },
  },
  social: [
    { name: "Facebook", icon: "facebook", url: "https://facebook.com/padelbap" },
    { name: "Instagram", icon: "instagram", url: "https://instagram.com/padelbap" },
  ],
  links: {
    useful: [
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
  copyright: `© ${new Date().getFullYear()} Padel Batu Alam Permai. All rights reserved.`,
};

// export const courts: Court[] = [
//   {
//     id: "court-1",
//     name: "Court 1 - Paradise",
//     description: "Premium glass court with tropical view",
//     available: true,
//   },
//   {
//     id: "court-2",
//     name: "Court 2 - Sunset",
//     description: "Perfect for evening matches",
//     available: true,
//   },
//   {
//     id: "court-3",
//     name: "Court 3 - Jungle",
//     description: "Surrounded by lush greenery",
//     available: true,
//   },
//   {
//     id: "court-4",
//     name: "Court 4 - Ocean",
//     description: "With refreshing ocean breeze",
//     available: false,
//   },
// ];

// export const timeSlots: TimeSlot[] = [
//   // Morning Peak
//   {
//     id: "slot-1",
//     time: "06:00 - 07:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-2",
//     time: "07:00 - 08:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-3",
//     time: "08:00 - 09:00",
//     available: false,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-4",
//     time: "09:00 - 10:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },

//   // Off-Peak
//   {
//     id: "slot-5",
//     time: "10:00 - 11:00",
//     available: true,
//     period: "off-peak",
//     pricePerPerson: 60000,
//   },
//   {
//     id: "slot-6",
//     time: "11:00 - 12:00",
//     available: true,
//     period: "off-peak",
//     pricePerPerson: 60000,
//   },
//   {
//     id: "slot-7",
//     time: "12:00 - 13:00",
//     available: true,
//     period: "off-peak",
//     pricePerPerson: 60000,
//   },
//   {
//     id: "slot-8",
//     time: "13:00 - 14:00",
//     available: true,
//     period: "off-peak",
//     pricePerPerson: 60000,
//   },
//   {
//     id: "slot-9",
//     time: "14:00 - 15:00",
//     available: true,
//     period: "off-peak",
//     pricePerPerson: 60000,
//   },

//   // Afternoon/Evening Peak
//   {
//     id: "slot-10",
//     time: "15:00 - 16:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-11",
//     time: "16:00 - 17:00",
//     available: false,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-12",
//     time: "17:00 - 18:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-13",
//     time: "18:00 - 19:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-14",
//     time: "19:00 - 20:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-15",
//     time: "20:00 - 21:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
//   {
//     id: "slot-16",
//     time: "21:00 - 22:00",
//     available: true,
//     period: "peak",
//     pricePerPerson: 100000,
//   },
// ];

export const paymentMethods = [
  { id: "bank-transfer", name: "Bank Transfer", fee: 0 },
  { id: "credit-card", name: "Credit/Debit Card", fee: 2500 },
  { id: "e-wallet", name: "E-Wallet (GoPay, OVO, DANA)", fee: 1500 },
  { id: "qris", name: "QRIS", fee: 0 },
];

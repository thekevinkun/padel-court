import {
  LayoutDashboard,
  Calendar,
  Building2,
  Clock,
  FileText,
  Settings,
  TrendingUp,
} from "lucide-react";

export const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: TrendingUp,
  },
  { name: "Courts", href: "/admin/courts", icon: Building2 },
  { name: "Time Slots", href: "/admin/time-slots", icon: Clock },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const pageTitles: Record<string, string> = {
  "/admin/bookings/": "Customer Booking",
  "/admin/bookings": "Bookings Management",
  "/admin/reports": "Financial Reports",
  "/admin/courts": "Courts Management",
  "/admin/time-slots": "Time Slots Management",
  "/admin/content": "Content Management",
  "/admin/settings": "Settings",
  "/admin": "Dashboard",
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

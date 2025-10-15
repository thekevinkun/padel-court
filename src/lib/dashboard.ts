import {
  LayoutDashboard,
  Calendar,
  Building2,
  Clock,
  FileText,
  Settings,
} from "lucide-react";

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

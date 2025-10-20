import type { Metadata } from "next";
import SettingsPageClient from "@/clients/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings - Admin Dashboard | Padel Batu Alam Permai",
  description:
    "Configure system settings, user permissions, payment options, and general preferences for Padel Batu Alam Permai. Customize the admin dashboard for efficient management and operations.",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}

import type { Metadata } from "next";
import DashboardLayoutClient from "@/clients/DashboardLayoutClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | Padel Batu Alam Permai",
  description:
    "Manage bookings, content, facilities, and administrative settings for Padel Batu Alam Permai.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
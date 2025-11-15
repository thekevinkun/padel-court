import type { Metadata } from "next";
import ReportsPageClient from "@/clients/ReportsPageClient";

export const metadata: Metadata = {
  title: "Financial Reports - Admin Dashboard | Padel Batu Alam Permai",
  description: "View detailed financial reports and analytics",
};

export default function ReportsPage() {
  return <ReportsPageClient />;
}

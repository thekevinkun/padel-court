import type { Metadata } from "next";
import ContentPageClient from "@/clients/ContentPageClient";

export const metadata: Metadata = {
  title: "Content Management - Admin Dashboard | Padel Batu Alam Permai",
  description:
    "Manage website content, including pages, blogs, images, and media for Padel Batu Alam Permai. Update and publish content to keep the site engaging and up-to-date.",
};

export default function ContentPage() {
  return <ContentPageClient />;
}

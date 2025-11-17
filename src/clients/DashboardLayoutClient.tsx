"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to login
        router.push("/login");
      } else if (!isAdmin) {
        // Logged in but not admin - redirect to homepage
        router.push("/");
      }
    }
  }, [user, loading, isAdmin, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          closeButton
          richColors
          expand={false}
          duration={Infinity}
        />

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="lg:pl-64 min-h-screen">
          {/* Header */}
          <DashboardHeader />

          {/* Page Content */}
          <main className="p-4 lg:p-8 pt-4">{children}</main>
        </div>
      </div>
    </NotificationsProvider>
  );
}

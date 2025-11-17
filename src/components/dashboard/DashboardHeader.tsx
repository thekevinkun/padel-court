"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pageTitles } from "@/lib/dashboard";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import { useNotifications } from "@/contexts/NotificationsContext";

const DashboardHeader = () => {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Admin Panel";
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Makassar",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <header className="bg-white px-4 lg:px-8 py-4 sticky top-0 shadow-md z-10">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {pageTitle}
            </h1>
            <p className="text-sm text-accent-foreground mt-1">{today}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => setIsPanelOpen(true)}
            >
              <Bell className="h-5 w-5" />

              {/* Animated Badge */}
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-5 flex items-center justify-center p-0 text-xs px-1"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulse effect for new notifications */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
};

export default DashboardHeader;

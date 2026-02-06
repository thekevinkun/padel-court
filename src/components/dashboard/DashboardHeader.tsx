"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Clock, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useNotifications } from "@/contexts/NotificationsContext";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";

import NotificationPanel from "@/components/dashboard/NotificationPanel";
import SoundSettingsPanel from "@/components/dashboard/SoundSettingsPanel";

import { pageTitles } from "@/lib/dashboard";

const DashboardHeader = () => {
  const pathname = usePathname();
  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] || "Admin Panel";

  const { unreadCount } = useNotifications();
  const { soundEnabled } = useSoundSettings();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  const today = new Date().toLocaleDateString("en-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Real-time clock that updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Format time in 24-hour format with seconds (HH:MM:SS)
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <>
      <header className="bg-white px-4 lg:px-8 py-4 sticky top-0 shadow-md z-40">
        <div className="flex items-center justify-between gap-2 sm:gap-0">
          {/* Page Title */}
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {pageTitle}
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 mt-1">
              <p className="text-xs sm:text-sm text-accent-foreground">{today}</p>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono text-forest">
                <Clock className="h-4 w-4" />
                <span className="font-semibold tabular-nums">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Sound Settings Button */}
            <Popover open={soundOpen} onOpenChange={setSoundOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  aria-label="Sound settings"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-forest" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0 w-auto">
                <SoundSettingsPanel />
              </PopoverContent>
            </Popover>

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
                      className="h-5 min-w-5 flex items-center justify-center p-0 text-xs text-muted-foreground px-1"
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

"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { pageTitles } from "@/lib/dashboard";

export default function DashboardHeader() {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Admin Panel";

  return (
    <header className="bg-white px-4 lg:px-8 py-4 sticky top-0 shadow-md z-10">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {pageTitle}
          </h1>
          <p className="text-sm text-accent-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}
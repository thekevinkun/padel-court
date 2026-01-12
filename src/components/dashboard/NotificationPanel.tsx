"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { useNotifications } from "@/contexts/NotificationsContext";

import { AdminNotification } from "@/types/notifications";
import { groupByDate, formatTimeAgo } from "@/lib/notification";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle notification click
  const handleNotificationClick = (notification: AdminNotification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to booking if exists
    if (notification.booking_id) {
      router.push(`/admin/bookings/${notification.booking_id}`);
      onClose();
    }
  };

  // Group notifications by date
  const groupedNotifications = groupByDate(notifications);

  // Get notification icon color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "NEW_BOOKING":
        return "bg-blue-100 text-blue-600";
      case "PAYMENT_RECEIVED":
        return "bg-green-100 text-green-600";
      case "PAYMENT_FAILED":
        return "bg-red-100 text-red-600";
      case "CANCELLATION":
        return "bg-orange-100 text-orange-600";
      case "SESSION_STARTED":
        return "bg-forest-100 text-forest-600";
      case "SESSION_COMPLETED":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : "No new notifications"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">All clear!</h3>
                  <p className="text-sm text-muted-foreground">
                    No notifications yet. They&apos;ll appear here when customers
                    book or make payments.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {Object.entries(groupedNotifications).map(([date, items]) => (
                    <div key={date}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 px-2">
                        {date}
                      </h3>
                      <div className="space-y-2">
                        {items.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                              relative p-4 rounded-lg border transition-all cursor-pointer
                              ${
                                notification.read
                                  ? "bg-white hover:bg-gray-50"
                                  : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                              }
                            `}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            {/* Unread indicator */}
                            {!notification.read && (
                              <div className="absolute top-4 left-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}

                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div
                                className={`p-2 rounded-lg ${getNotificationColor(
                                  notification.type
                                )}`}
                              >
                                {notification.type === "NEW_BOOKING" && "📅"}
                                {notification.type === "PAYMENT_RECEIVED" &&
                                  "💰"}
                                {notification.type === "PAYMENT_FAILED" && "❌"}
                                {notification.type === "CANCELLATION" && "🚫"}
                                {notification.type === "SESSION_STARTED" && "🎾"}
                                {notification.type === "SESSION_COMPLETED" && "🏁"}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-sm">
                                    {notification.title}
                                  </h4>
                                  {notification.booking_id && (
                                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimeAgo(notification.created_at)}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationPanel;

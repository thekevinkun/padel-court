import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { AdminNotification } from "@/types/notifications";
import { supabase } from "@/lib/supabase/client";

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get sound playback function
  const { playSound } = useSoundSettings();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50); // Last 50 notifications

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ read: true })
        .eq("read", false);

      if (error) throw error;

      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("admin_notifications")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Optimistic update
        const notification = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        // toast.success("Notification deleted");
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.error("Failed to delete notification");
      }
    },
    [notifications]
  );

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("admin_notifications_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification;

          console.log("New notification received:", newNotification);

          // Play sound based on notification type
          playSound(newNotification.type);

          // Add to state
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast notification (stays until closed)
          toast(newNotification.title, {
            description: newNotification.message,
            duration: Infinity, // Stays until manually closed
            action: newNotification.booking_id
              ? {
                  label: "View",
                  onClick: () => {
                    window.location.href = `/admin/bookings/${newNotification.booking_id}`;
                  },
                }
              : undefined,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          const updated = payload.new as AdminNotification;

          console.log("Notification updated:", updated);

          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );

          // Recalculate unread count based on current state
          setNotifications((currentNotifications) => {
            const oldNotification = currentNotifications.find(
              (n) => n.id === updated.id
            );

            if (oldNotification && !oldNotification.read && updated.read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            } else if (
              oldNotification &&
              oldNotification.read &&
              !updated.read
            ) {
              setUnreadCount((prev) => prev + 1);
            }

            return currentNotifications.map((n) =>
              n.id === updated.id ? updated : n
            );
          });
        }
      )
      .subscribe((status) => {
        console.log("Notification subscription status:", status);
      });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [playSound]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}

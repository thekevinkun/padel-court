import { AdminNotification } from "@/types";

// Group notifications by date
export function groupByDate(notifications: AdminNotification[]) {
  const groups: Record<string, AdminNotification[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let label = "";
    if (dateOnly.getTime() === today.getTime()) {
      label = "Today";
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      label = "Yesterday";
    } else if (dateOnly >= weekAgo) {
      label = "This Week";
    } else {
      label = "Older";
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(notification);
  });

  return groups;
}

// Format time ago
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
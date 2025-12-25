export interface AdminNotification {
  id: string;
  booking_id: string | null;
  type: "NEW_BOOKING" | "PAYMENT_RECEIVED" | "PAYMENT_FAILED" | "CANCELLATION" | "SESSION_STARTED" | "SESSION_COMPLETED";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface NotificationsContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export type NotificationSoundType =
  | "NEW_BOOKING"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "CANCELLATION"
  | "SESSION_STARTED"
  | "SESSION_COMPLETED";

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-1
}

export interface SoundSettingsContextType {
  soundEnabled: boolean;
  volume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  playSound: (type: NotificationSoundType) => void;
  testSound: (type: NotificationSoundType) => void;
}

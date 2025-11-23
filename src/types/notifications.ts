export type NotificationSoundType = "NEW_BOOKING" | "PAYMENT_RECEIVED" | "PAYMENT_FAILED" | "CANCELLATION";

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
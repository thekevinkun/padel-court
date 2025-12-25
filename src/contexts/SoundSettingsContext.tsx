import React, { createContext, useContext, useState, useEffect } from "react";
import { NotificationSoundType, SoundSettings, SoundSettingsContextType } from "@/types/notifications";

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

const SOUND_FILES: Record<NotificationSoundType, string> = {
  NEW_BOOKING: "/sounds/new-booking.mp3",
  PAYMENT_RECEIVED: "/sounds/payment-success.mp3",
  PAYMENT_FAILED: "/sounds/payment-failed.mp3",
  CANCELLATION: "/sounds/cancellation.mp3",
  SESSION_STARTED: "/sounds/session-started.mp3",
  SESSION_COMPLETED: "/sounds/session-completed.mp3",
};

const STORAGE_KEY = "admin_sound_settings";

export function SoundSettingsProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7); // 70% default

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings: SoundSettings = JSON.parse(stored);
        setSoundEnabled(settings.enabled);
        setVolume(settings.volume);
        console.log("Sound settings loaded:", settings);
      }
    } catch (error) {
      console.error("Failed to load sound settings:", error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settings: SoundSettings = {
        enabled: soundEnabled,
        volume,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      console.log("Sound settings saved:", settings);
    } catch (error) {
      console.error("Failed to save sound settings:", error);
    }
  }, [soundEnabled, volume]);

  // Play sound function
  const playSound = (type: NotificationSoundType) => {
    // Don't play if disabled
    if (!soundEnabled) {
      console.log("Sound disabled, skipping:", type);
      return;
    }

    // Don't play if page is hidden (tab not active)
    if (document.hidden) {
      console.log("Page hidden, skipping sound:", type);
      return;
    }

    try {
      const audio = new Audio(SOUND_FILES[type]);
      audio.volume = volume;
      audio.play().catch((error) => {
        console.warn("Sound play failed (this is normal on first load):", error);
      });
      console.log(`Playing sound: ${type} at volume ${Math.round(volume * 100)}%`);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Test sound function (for preview in settings)
  const testSound = (type: NotificationSoundType) => {
    try {
      const audio = new Audio(SOUND_FILES[type]);
      audio.volume = volume;
      audio.play().catch((error) => {
        console.warn("Test sound play failed:", error);
      });
      console.log(`Testing sound: ${type}`);
    } catch (error) {
      console.error("Error testing sound:", error);
    }
  };

  const value = {
    soundEnabled,
    volume,
    setSoundEnabled,
    setVolume,
    playSound,
    testSound,
  };

  return <SoundSettingsContext.Provider value={value}>{children}</SoundSettingsContext.Provider>;
}

// Hook to use sound settings
export function useSoundSettings() {
  const context = useContext(SoundSettingsContext);
  if (context === undefined) {
    throw new Error("useSoundSettings must be used within a SoundSettingsProvider");
  }
  return context;
}
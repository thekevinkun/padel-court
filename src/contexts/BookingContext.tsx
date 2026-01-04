"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Create context for booking state
const BookingContext = createContext<{
  isOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
} | null>(null);

// Provider component
export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openBooking = () => setIsOpen(true);
  const closeBooking = () => setIsOpen(false);

  return (
    <BookingContext.Provider value={{ isOpen, openBooking, closeBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

// Hook to use booking context
export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingDialogWrapper");
  }
  return context;
}

import { Suspense } from "react";
import BookingStatusCheckClient from "@/clients/BookingStatusCheckClient";

export default function BookingStatusCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        </div>
      }
    >
      <BookingStatusCheckClient />
    </Suspense>
  );
}

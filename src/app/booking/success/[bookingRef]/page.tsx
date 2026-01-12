import { Suspense } from "react";
import BookingSuccessPageClient from "@/clients/BookingSuccessPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BookingSuccessPageClient />
    </Suspense>
  );
}

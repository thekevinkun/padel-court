import { Suspense } from "react";
import BookingFailedPageClient from "@/clients/BookingFailedPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BookingFailedPageClient />
    </Suspense>
  );
}

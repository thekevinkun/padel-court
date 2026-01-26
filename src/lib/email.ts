import { Resend } from "resend";
import { render } from "@react-email/components";
import BookingConfirmationEmail from "@/emails/BookingConfirmation";
import BookingReminderEmail from "@/emails/BookingReminder";
import RefundConfirmationEmail from "@/emails/RefundConfirmation";
import CancellationConfirmationEmail from "@/emails/CancellationConfirmation";

import {
  BookingEmailData,
  ReminderEmailData,
  RefundEmailData,
  CancellationEmailData,
} from "@/types/email";
import { createServerClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const emailUser = process.env.EMAIL_USER;

/**
 * Send booking confirmation email after successful payment
 */
export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    const supabase = createServerClient();
    const { data: settings } = await supabase
      .from("site_settings")
      .select("logo_url")
      .single();

    const logoUrl =
      settings?.logo_url ||
      `${process.env.NEXT_PUBLIC_SITE_URL}/logos/logo-black.webp`;

    const emailHtml = await render(
      BookingConfirmationEmail({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        bookingRef: data.bookingRef,
        courtName: data.courtName,
        date: data.date,
        time: data.time,
        numberOfPlayers: data.numberOfPlayers,
        totalAmount: data.totalAmount,
        requireDeposit: data.requireDeposit,
        depositAmount: data.depositAmount,
        remainingBalance: data.remainingBalance,
        paymentMethod: data.paymentMethod,
        logoUrl,
      }),
    );

    // Send to our email in test mode (resend rules without domain)
    const recipientEmail =
      process.env.NODE_ENV === "production" ? data.customerEmail : emailUser;

    if (!recipientEmail) {
      console.error("Error. No recipent email provided.");
      return { success: false };
    }

    const { data: result, error } = await resend.emails.send({
      from: "Padel Batu Alam Permai <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Booking Confirmed - ${data.bookingRef}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Email send failed:", error);
      return { success: false, error };
    }

    console.log("Booking confirmation email sent:", result?.id);
    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return { success: false, error };
  }
}

/**
 * Send booking reminder email 24 hours before session
 */
export async function sendBookingReminder(data: ReminderEmailData) {
  try {
    const supabase = createServerClient();
    const { data: settings } = await supabase
      .from("site_settings")
      .select("logo_url")
      .single();

    const logoUrl =
      settings?.logo_url ||
      `${process.env.NEXT_PUBLIC_SITE_URL}/logos/logo-black.webp`;

    const emailHtml = await render(
      BookingReminderEmail({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        bookingRef: data.bookingRef,
        courtName: data.courtName,
        date: data.date,
        time: data.time,
        requireDeposit: data.requireDeposit,
        remainingBalance: data.remainingBalance,
        venuePaymentReceived: data.venuePaymentReceived,
        logoUrl,
      }),
    );

    const recipientEmail =
      process.env.NODE_ENV === "production" ? data.customerEmail : emailUser;

    if (!recipientEmail) {
      console.error("Error. No recipent email provided.");
      return { success: false };
    }

    const { data: result, error } = await resend.emails.send({
      from: "Padel Batu Alam Permai <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Reminder: Your session is coming up soon!`,
      html: emailHtml,
    });

    if (error) {
      console.error("Email send failed:", error);
      return { success: false, error };
    }

    console.log("Booking reminder email sent:", result?.id);
    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error("Error sending booking reminder:", error);
    return { success: false, error };
  }
}

/**
 * Send refund confirmation email
 */
export async function sendRefundConfirmation(data: RefundEmailData) {
  try {
    const supabase = createServerClient();
    const { data: settings } = await supabase
      .from("site_settings")
      .select("logo_url")
      .single();

    const logoUrl =
      settings?.logo_url ||
      `${process.env.NEXT_PUBLIC_SITE_URL}/logos/logo-black.webp`;

    const emailHtml = await render(
      RefundConfirmationEmail({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        bookingRef: data.bookingRef,
        courtName: data.courtName,
        date: data.date,
        time: data.time,
        originalAmount: data.originalAmount,
        refundAmount: data.refundAmount,
        refundMethod: data.refundMethod,
        refundReason: data.refundReason,
        logoUrl,
      }),
    );

    const recipientEmail =
      process.env.NODE_ENV === "production" ? data.customerEmail : emailUser;

    if (!recipientEmail) {
      console.error("Error. No recipent email provided.");
      return { success: false };
    }

    const { data: result, error } = await resend.emails.send({
      from: "Padel Batu Alam Permai <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Refund Processed - ${data.bookingRef}`,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Refund email send failed:", error);
      return { success: false, error };
    }

    console.log("✅ Refund confirmation email sent:", result?.id);
    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error("❌ Error sending refund confirmation:", error);
    return { success: false, error };
  }
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationConfirmation(
  data: CancellationEmailData,
) {
  try {
    // Fetch logo URL from settings
    const { createServerClient } = await import("@/lib/supabase/server");
    const supabase = createServerClient();

    const { data: settings } = await supabase
      .from("site_settings")
      .select("logo_url")
      .single();

    const logoUrl =
      settings?.logo_url ||
      `${process.env.NEXT_PUBLIC_SITE_URL}/logos/logo-black.webp`;

    const emailHtml = await render(
      CancellationConfirmationEmail({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        bookingRef: data.bookingRef,
        courtName: data.courtName,
        date: data.date,
        time: data.time,
        originalAmount: data.originalAmount,
        refundAmount: data.refundAmount,
        refundEligible: data.refundEligible,
        cancellationReason: data.cancellationReason,
        hoursBeforeBooking: data.hoursBeforeBooking,
        logoUrl,
      }),
    );

    const recipientEmail =
      process.env.NODE_ENV === "production"
        ? data.customerEmail
        : process.env.EMAIL_USER;

    if (!recipientEmail) {
      console.error("Error. No recipient email provided.");
      return { success: false };
    }

    const { data: result, error } = await resend.emails.send({
      from: "Padel Batu Alam Permai <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Cancellation Confirmed - ${data.bookingRef}`,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Cancellation email send failed:", error);
      return { success: false, error };
    }

    console.log("✅ Cancellation confirmation email sent:", result?.id);
    return { success: true, emailId: result?.id };
  } catch (error) {
    console.error("❌ Error sending cancellation confirmation:", error);
    return { success: false, error };
  }
}

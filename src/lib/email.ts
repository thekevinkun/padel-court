import { Resend } from "resend";
import { render } from "@react-email/components";
import BookingConfirmationEmail from "@/emails/BookingConfirmation";
import BookingReminderEmail from "@/emails/BookingReminder";
import RefundConfirmationEmail from "@/emails/RefundConfirmation";

import {
  BookingEmailData,
  ReminderEmailData,
  RefundEmailData,
} from "@/types/email";

const resend = new Resend(process.env.RESEND_API_KEY);
const emailUser = process.env.EMAIL_USER;

/**
 * Send booking confirmation email after successful payment
 */
export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
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
      subject: `Reminder: Your session is tomorrow!`,
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

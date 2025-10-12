import { ReceiptData } from "./pdf-generator";

/**
 * Sends booking receipt details via WhatsApp
 * Opens WhatsApp with pre-filled message
 * 
 * @param phoneNumber - WhatsApp number (will be cleaned of non-digits)
 * @param receiptData - Booking receipt data
 * @param pdfBlob - Optional PDF blob (for future implementation)
 */
export const sendWhatsAppReceipt = (
  phoneNumber: string,
  receiptData: ReceiptData,
  pdfBlob?: Blob
) => {
  // Clean phone number - remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  
  // Ensure number starts with country code (62 for Indonesia)
  const formattedNumber = cleanNumber.startsWith("62")
    ? cleanNumber
    : cleanNumber.startsWith("0")
    ? `62${cleanNumber.slice(1)}`
    : `62${cleanNumber}`;

  // Create formatted WhatsApp message
  const message = formatWhatsAppMessage(receiptData);

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Generate WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

  // Open WhatsApp in new tab
  window.open(whatsappUrl, "_blank");

  // Optional: Log for debugging
  console.log("📱 WhatsApp receipt sent to:", formattedNumber);
  console.log("📄 Receipt data:", receiptData);

  // Note: In a real implementation, you would also:
  // 1. Save the PDF to cloud storage (S3, Cloudinary, etc.)
  // 2. Include the PDF link in the WhatsApp message
  // 3. Or integrate with WhatsApp Business API to send PDF directly
};

/**
 * Formats booking data into a WhatsApp-friendly message
 */
const formatWhatsAppMessage = (data: ReceiptData): string => {
  const divider = "━━━━━━━━━━━━━━━━━━━━";
  
  return `
🎾 *PADEL BATU ALAM PERMAI*
${divider}

✅ *BOOKING CONFIRMED*

📋 *Booking Reference:*
${data.bookingRef}

${divider}

👤 *Customer Details:*
• Name: ${data.customerName}
• Email: ${data.email}
• Phone: ${data.phone}

${divider}

🏟️ *Booking Details:*
• Court: ${data.courtName}
• Date: ${data.date}
• Time: ${data.time}
• Players: ${data.numberOfPlayers} ${data.numberOfPlayers === 1 ? "person" : "people"}

${data.notes && data.notes !== "-" ? `• Notes: ${data.notes}\n\n${divider}\n\n` : `\n${divider}\n\n`}💰 *Payment Summary:*
• Court Booking: IDR ${data.subtotal.toLocaleString("id-ID")}
• Payment Fee: IDR ${data.paymentFee.toLocaleString("id-ID")}
• *TOTAL PAID: IDR ${data.total.toLocaleString("id-ID")}*

${divider}

⚠️ *Important:*
• Arrive 10 mins before scheduled time
• Show this message at reception
• Cancellation: 24hrs advance notice

${divider}

🕒 Booked on: ${data.timestamp}

Thank you for choosing us! 🙏
See you on the court! 🎾

_For inquiries: +62 812 3456 7890_
`.trim();
};

/**
 * Alternative: Send simplified WhatsApp message
 * Use this for shorter, mobile-friendly messages
 */
export const sendSimpleWhatsAppReceipt = (
  phoneNumber: string,
  receiptData: ReceiptData
) => {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const formattedNumber = cleanNumber.startsWith("62")
    ? cleanNumber
    : cleanNumber.startsWith("0")
    ? `62${cleanNumber.slice(1)}`
    : `62${cleanNumber}`;

  const message = `
🎾 *BOOKING CONFIRMED*

Ref: ${receiptData.bookingRef}
Court: ${receiptData.courtName}
Date: ${receiptData.date}
Time: ${receiptData.time}
Total: IDR ${receiptData.total.toLocaleString("id-ID")}

See you soon! 🙏
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, "_blank");
};

/**
 * Validates Indonesian phone number format
 */
export const validateIndonesianPhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Check if it's a valid Indonesian number
  // Should start with 62 or 0, and be 10-13 digits long
  if (cleaned.startsWith("62")) {
    return cleaned.length >= 11 && cleaned.length <= 14;
  } else if (cleaned.startsWith("0")) {
    return cleaned.length >= 10 && cleaned.length <= 13;
  }
  
  return false;
};

/**
 * Formats phone number for display
 * Example: 081234567890 -> +62 812 3456 7890
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  
  let formatted = cleaned;
  if (cleaned.startsWith("0")) {
    formatted = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    formatted = "62" + cleaned;
  }
  
  // Format as: +62 812 3456 7890
  return `+${formatted.slice(0, 2)} ${formatted.slice(2, 5)} ${formatted.slice(
    5,
    9
  )} ${formatted.slice(9)}`;
};
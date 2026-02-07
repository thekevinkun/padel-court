import jsPDF from "jspdf";
import { ReceiptData } from "@/types/booking";

const checkPageBreak = (
  doc: jsPDF,
  yPos: number,
  requiredSpace: number = 40,
): number => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 20;

  if (yPos + requiredSpace > pageHeight - bottomMargin) {
    doc.addPage();
    return 20; // Reset yPos to top of new page with margin
  }
  return yPos;
};

export const generateBookingReceipt = async (
  data: ReceiptData,
): Promise<Blob> => {
  const doc = new jsPDF();
  console.log("data: ", data);
  // Load logo image
  const logoUrl = "/logos/logo.png";
  let logoBase64 = "";
  

  try {
    // Fetch logo and convert to base64
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to load logo:", error);
    // Continue without logo
  }
  console.log("logo: ", logoBase64);
  // Header - Club Name with Logo
  doc.setFillColor(255, 204, 0); // yellow
  doc.rect(0, 0, 210, 50, "F");

  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 50;
  const logoHeight = 25;
  const logoY = 8;

  // Add logo if loaded
  if (logoBase64.startsWith("data:image/png")) {
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logoBase64, "png", logoX, logoY, logoWidth, logoHeight);
  } else {
    console.warn("Skipping logo: not a valid PNG");
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Padel Courts • Batu Alam Permai", 105, 38, {
    align: "center",
  });
  doc.setFontSize(8);
  doc.setTextColor(64, 64, 64);
  doc.text("Samarinda, East Kalimantan", 105, 44, { align: "center" });

  // Booking Reference Badge
  doc.setFillColor(255, 204, 0); // yellow
  doc.roundedRect(15, 60, 80, 12, 3, 3, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING REF:", 20, 67);
  doc.text(data.bookingRef, 55, 67);

  const getStatusInfo = () => {
    // Check if this is from My Booking (receiptData might have status info)
    const isPaid = data.paymentMethod && data.paymentMethod !== "N/A";

    // Default to CONFIRMED for backward compatibility
    return {
      color: [34, 197, 94] as [number, number, number], // green
      text: "CONFIRMED",
      textColor: [255, 255, 255] as [number, number, number],
    };
  };

  // Payment status badge based on status info
  const statusInfo = getStatusInfo();
  doc.setFillColor(...statusInfo.color);
  doc.roundedRect(115, 60, 80, 12, 3, 3, "F");
  doc.setTextColor(...statusInfo.textColor);
  doc.text(statusInfo.text, 155, 67, { align: "center" });

  // Reset text color
  doc.setTextColor(31, 41, 55);

  // Customer Information Section
  let yPos = 85; // Changed from 75 to 85
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 15, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const customerInfo = [
    ["Name:", data.customerName],
    ["Email:", data.email],
    ["Phone:", data.phone],
  ];

  customerInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 50, yPos);
    yPos += 7;
  });

  // Booking Details Section
  yPos += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Booking Details", 15, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const bookingDetails = [
    ["Court:", data.courtName],
    ["Date:", data.date],
    ["Time:", data.time],
    [
      "Players:",
      `${data.numberOfPlayers} ${data.numberOfPlayers === 1 ? "person" : "people"}`,
    ],
    ["Notes:", data.notes],
  ];

  bookingDetails.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 50, yPos);
    yPos += 7;
  });

  // Equipment Rental Section
  if (data.equipmentRentals && data.equipmentRentals.length > 0) {
    yPos = checkPageBreak(doc, yPos, 30); // Check if we need new page
    yPos += 8;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Equipment Rental", 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    data.equipmentRentals.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.text(`• ${item.name}`, 15, yPos);
      doc.text(`${item.quantity}x`, 50, yPos);
      doc.text(`IDR ${item.subtotal.toLocaleString("id-ID")}`, 190, yPos, {
        align: "right",
      });
      yPos += 6;
    });
  }

  // Additional Players Section
  if (data.additionalPlayers && data.additionalPlayers.length > 0) {
    yPos = checkPageBreak(doc, yPos, 30); // Check if we need new page
    yPos += 8;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Players", 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Primary booker
    doc.text(`• ${data.customerName} (Primary Booker)`, 15, yPos);
    yPos += 6;

    // Additional players
    data.additionalPlayers.forEach((player) => {
      doc.text(`• ${player.name}`, 15, yPos);
      yPos += 6;
    });
  }

  // Payment Summary Box
  yPos = checkPageBreak(doc, yPos, 60); // Check if we need new page
  yPos += 8;
  doc.setFillColor(243, 244, 246); // light gray
  doc.roundedRect(15, yPos, 180, 55, 3, 3, "F");

  yPos += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Summary", 20, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Calculate court subtotal
  const equipmentTotal =
    data.equipmentRentals?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
  const courtSubtotal = data.subtotal - equipmentTotal;

  // Price breakdown
  const priceBreakdown: string[][] = [
    [
      `Court Booking (${data.numberOfPlayers}x IDR ${(courtSubtotal / data.numberOfPlayers).toLocaleString("id-ID")})`,
      `IDR ${courtSubtotal.toLocaleString("id-ID")}`,
    ],
  ];

  // Add equipment if any
  if (data.equipmentRentals && data.equipmentRentals.length > 0) {
    data.equipmentRentals.forEach((item) => {
      priceBreakdown.push([
        `${item.name} (${item.quantity}x)`,
        `IDR ${item.subtotal.toLocaleString("id-ID")}`,
      ]);
    });
  }

  // Add payment fee
  priceBreakdown.push([
    `Payment Fee (${data.paymentMethod})`,
    `IDR ${data.paymentFee.toLocaleString("id-ID")}`,
  ]);

  priceBreakdown.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, 20, yPos);
    doc.text(value, 190, yPos, { align: "right" });
    yPos += 6;
  });

  // Draw line separator
  yPos += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(45, 106, 79); // forest green
  doc.text("TOTAL:", 20, yPos);
  doc.text(`IDR ${data.total.toLocaleString("id-ID")}`, 190, yPos, {
    align: "right",
  });

  // Reset text color
  doc.setTextColor(31, 41, 55);

  // Important Notes Section
  yPos = checkPageBreak(doc, yPos, 40); // CRITICAL: Check if we need new page
  yPos += 15;
  doc.setFillColor(255, 251, 235); // light yellow
  doc.roundedRect(15, yPos, 180, 30, 3, 3, "F");

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("! Important Information:", 20, yPos);

  yPos += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("• Please arrive 10 minutes before your scheduled time", 20, yPos);
  yPos += 5;
  doc.text("• Bring this receipt or booking reference for check-in", 20, yPos);
  yPos += 5;
  doc.text("• Cancellation must be made 24 hours in advance", 20, yPos);

  // Footer
  yPos = checkPageBreak(doc, yPos, 20); // Check if we need new page
  yPos += 15;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Booking Time: ${data.timestamp}`, 105, yPos, { align: "center" });

  yPos += 5;
  doc.text("Thank you for choosing Padel Batu Alam Permai!", 105, yPos, {
    align: "center",
  });

  yPos += 4;
  doc.text("Contact: +62 812 3456 7890 | info@padelbap.com", 105, yPos, {
    align: "center",
  });

  // Convert to Blob
  const pdfBlob = doc.output("blob");
  return pdfBlob;
};

// Optional: Function to download the PDF directly
export const downloadReceipt = (data: ReceiptData) => {
  // const doc = new jsPDF();
  generateBookingReceipt(data).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Padel-Receipt-${data.bookingRef}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  });
};

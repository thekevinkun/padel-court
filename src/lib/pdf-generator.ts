import jsPDF from "jspdf";

export interface ReceiptData {
  bookingRef: string;
  customerName: string;
  email: string;
  phone: string;
  courtName: string;
  date: string;
  time: string;
  numberOfPlayers: number;
  pricePerPerson: number;
  subtotal: number;
  paymentMethod: string;
  paymentFee: number;
  total: number;
  notes: string;
  timestamp: string;
}

export const generateBookingReceipt = async (
  data: ReceiptData
): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = "#ffcc00"; // yellow
  const accentColor = "#2d6a4f"; // forest green
  const textColor = "#1f2937";
  const lightGray = "#f3f4f6";

  // Header - Club Name
  doc.setFillColor(255, 204, 0); // yellow
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PADEL BATU ALAM PERMAI", 105, 18, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Padel Courts • Batu Alam Permai", 105, 28, {
    align: "center",
  });

  // Booking Reference Badge
  doc.setFillColor(255, 204, 0); // yellow
  doc.roundedRect(15, 50, 80, 12, 3, 3, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING REF:", 20, 57);
  doc.text(data.bookingRef, 55, 57);

  // Payment Status Badge
  doc.setFillColor(34, 197, 94); // green
  doc.roundedRect(115, 50, 80, 12, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("✔ CONFIRMED", 155, 57, { align: "center" });

  // Reset text color
  doc.setTextColor(31, 41, 55);

  // Customer Information Section
  let yPos = 75;
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
    ["Players:", `${data.numberOfPlayers} ${data.numberOfPlayers === 1 ? "person" : "people"}`],
    ["Notes:", data.notes],
  ];

  bookingDetails.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 50, yPos);
    yPos += 7;
  });

  // Payment Summary Box
  yPos += 8;
  doc.setFillColor(243, 244, 246); // light gray
  doc.roundedRect(15, yPos, 180, 45, 3, 3, "F");
  
  yPos += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Summary", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Price breakdown
  const priceBreakdown = [
    [
      `Court Booking (${data.numberOfPlayers}x IDR ${data.pricePerPerson.toLocaleString("id-ID")})`,
      `IDR ${data.subtotal.toLocaleString("id-ID")}`,
    ],
    [`Payment Fee (${data.paymentMethod})`, `IDR ${data.paymentFee.toLocaleString("id-ID")}`],
  ];

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
  yPos += 15;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Booking Time: ${data.timestamp}`,
    105,
    yPos,
    { align: "center" }
  );
  
  yPos += 5;
  doc.text(
    "Thank you for choosing Padel Batu Alam Permai!",
    105,
    yPos,
    { align: "center" }
  );
  
  yPos += 4;
  doc.text(
    "Contact: +62 812 3456 7890 | info@padelbap.com",
    105,
    yPos,
    { align: "center" }
  );

  // Convert to Blob
  const pdfBlob = doc.output("blob");
  return pdfBlob;
};

// Optional: Function to download the PDF directly
export const downloadReceipt = (data: ReceiptData) => {
  const doc = new jsPDF();
  generateBookingReceipt(data).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Padel-Receipt-${data.bookingRef}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  });
};
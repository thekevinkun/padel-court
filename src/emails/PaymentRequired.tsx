import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Img,
} from "@react-email/components";
import { PaymentRequiredEmailProps } from "@/types/email";

export default function PaymentRequiredEmail({
  customerName,
  customerEmail,
  bookingRef,
  courtName,
  date,
  time,
  numberOfPlayers,
  totalAmount,
  requireDeposit,
  depositAmount,
  paymentUrl,
  equipmentRentals,
  additionalPlayers,
  logoEmailUrl,
}: PaymentRequiredEmailProps) {
  // Calculate equipment total
  const equipmentTotal =
    equipmentRentals?.reduce((sum, item) => sum + item.subtotal, 0) || 0;

  return (
    <Html>
      <Head />
      <Preview>Complete Your Payment - Booking Reserved for 24 Hours</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <table width="100%" cellPadding="0" cellSpacing="0" style={header}>
            <tr>
              <td align="center" style={{ padding: "32px 24px" }}>
                <Img
                  src={logoEmailUrl}
                  alt="Padel Batu Alam Permai"
                  width="180"
                  height="auto"
                  style={{ margin: "0 auto 16px" }}
                />
                <Heading style={h1}>⏰ Payment Required</Heading>
                <Text style={headerText}>
                  YOUR BOOKING IS RESERVED - COMPLETE PAYMENT TO CONFIRM
                </Text>
              </td>
            </tr>
          </table>

          {/* Urgent Notice */}
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tr>
              <td style={{ padding: "0 24px" }}>
                <table
                  width="100%"
                  cellPadding="16"
                  cellSpacing="0"
                  style={urgentBox}
                >
                  <tr>
                    <td align="center">
                      <Text style={urgentText}>
                        ⏳ Payment Window: 24 Hours
                      </Text>
                      <Text style={bookingRefText}>
                        Booking Ref: <strong>{bookingRef}</strong>
                      </Text>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* Greeting */}
          <Section style={section}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Your booking has been created and the time slot is temporarily
              reserved for you. Please complete your payment within{" "}
              <strong>24 hours</strong> to confirm your booking.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Booking Details */}
          <Section style={section}>
            <Heading style={h2}>Booking Details</Heading>
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ marginTop: "16px" }}
            >
              <tr>
                <td style={detailLabel}>Court:</td>
                <td style={detailValue}>{courtName}</td>
              </tr>
              <tr>
                <td style={{ ...detailLabel, paddingTop: "12px" }}>Date:</td>
                <td style={{ ...detailValue, paddingTop: "12px" }}>{date}</td>
              </tr>
              <tr>
                <td style={{ ...detailLabel, paddingTop: "12px" }}>Time:</td>
                <td style={{ ...detailValue, paddingTop: "12px" }}>{time}</td>
              </tr>
              <tr>
                <td style={{ ...detailLabel, paddingTop: "12px" }}>Players:</td>
                <td style={{ ...detailValue, paddingTop: "12px" }}>
                  {numberOfPlayers}
                </td>
              </tr>
              {/* Player Names */}
              {additionalPlayers && additionalPlayers.length > 0 && (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      paddingTop: "8px",
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    <div style={{ paddingLeft: "8px" }}>
                      <div>• {customerName} (Primary Booker)</div>
                      {additionalPlayers.map((player, index) => (
                        <div key={index}>• {player.name}</div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </table>
          </Section>

          <Hr style={hr} />

          {/* Equipment Rental Section */}
          {equipmentRentals && equipmentRentals.length > 0 && (
            <>
              <Section style={section}>
                <Heading style={h2}>Equipment Rental</Heading>
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ marginTop: "16px" }}
                >
                  {equipmentRentals.map((item, index) => (
                    <tr key={index}>
                      <td style={detailLabel}>
                        {item.name} ({item.quantity}x):
                      </td>
                      <td style={detailValue}>
                        IDR {item.subtotal.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </table>
              </Section>
              <Hr style={hr} />
            </>
          )}

          {/* Payment Summary */}
          <Section style={section}>
            <Heading style={h2}>Payment Summary</Heading>
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ marginTop: "16px" }}
            >
              <tr>
                <td style={detailLabel}>Court Booking:</td>
                <td style={detailValue}>
                  IDR {(totalAmount - equipmentTotal).toLocaleString("id-ID")}
                </td>
              </tr>
              {equipmentTotal > 0 && (
                <tr>
                  <td style={{ ...detailLabel, paddingTop: "8px" }}>
                    Equipment Rental:
                  </td>
                  <td style={{ ...detailValue, paddingTop: "8px" }}>
                    IDR {equipmentTotal.toLocaleString("id-ID")}
                  </td>
                </tr>
              )}
            </table>

            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ marginTop: "16px" }}
            >
              <tr>
                <td style={detailLabel}>
                  <strong>
                    {requireDeposit ? "Pay Now (Deposit):" : "Total to Pay:"}
                  </strong>
                </td>
                <td
                  style={{
                    ...detailValue,
                    color: "#f59e0b",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  IDR {totalAmount.toLocaleString("id-ID")}
                </td>
              </tr>
              {requireDeposit && depositAmount && (
                <tr>
                  <td style={{ ...detailLabel, paddingTop: "8px" }} colSpan={2}>
                    <Text style={smallText}>
                      Remaining balance (IDR{" "}
                      {(totalAmount - depositAmount).toLocaleString("id-ID")})
                      will be paid at venue
                    </Text>
                  </td>
                </tr>
              )}
            </table>
          </Section>

          <Hr style={hr} />

          {/* CTA: Complete Payment */}
          <Section style={section}>
            <table width="100%" cellPadding="16" cellSpacing="0" style={ctaBox}>
              <tr>
                <td align="center">
                  <Heading style={h3}>💳 Complete Your Payment</Heading>
                  <Text
                    style={{
                      ...paragraph,
                      marginTop: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    Click the button below to choose your payment method and
                    complete the transaction:
                  </Text>
                  <a href={paymentUrl} style={ctaButton}>
                    Pay Now →
                  </a>
                  <Text
                    style={{
                      ...smallText,
                      marginTop: "16px",
                      color: "#6b7280",
                    }}
                  >
                    Or copy this link:{" "}
                    <a
                      href={paymentUrl}
                      style={{ color: "#3b82f6", wordBreak: "break-all" }}
                    >
                      {paymentUrl}
                    </a>
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Important Notes */}
          <Section style={section}>
            <table
              width="100%"
              cellPadding="16"
              cellSpacing="0"
              style={warningBox}
            >
              <tr>
                <td>
                  <Heading style={h3}>⚠️ Important</Heading>
                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ marginTop: "8px" }}
                  >
                    <tr>
                      <td style={listItem}>
                        • Payment must be completed within{" "}
                        <strong>24 hours</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style={listItem}>
                        • If unpaid, your booking will be automatically
                        cancelled
                      </td>
                    </tr>
                    <tr>
                      <td style={listItem}>
                        • The time slot will be released for others to book
                      </td>
                    </tr>
                    <tr>
                      <td style={listItem}>
                        • Lost the payment page? You can access it anytime via
                        the link above
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Access Booking Online */}
          <Section style={section}>
            <table width="100%" cellPadding="16" cellSpacing="0" style={ctaBox}>
              <tr>
                <td align="center">
                  <Heading style={h3}>📱 Track Your Booking</Heading>
                  <Text
                    style={{
                      ...paragraph,
                      marginTop: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    You can view your booking status and payment details
                    anytime:
                  </Text>
                  <a
                    href={`${process.env.NEXT_PUBLIC_SITE_URL}/my-booking?email=${encodeURIComponent(customerEmail)}&booking_ref=${bookingRef}`}
                    style={ctaButton}
                  >
                    View Booking Details →
                  </a>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Contact Info */}
          <Section style={section}>
            <Text style={paragraph}>Need help with payment?</Text>
            <Text style={contactText}>
              📱 WhatsApp: +62 812 3955 3510
              <br />
              📧 Email: info@padelbap.com
            </Text>
          </Section>

          {/* Footer */}
          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{ marginTop: "24px" }}
          >
            <tr>
              <td style={{ padding: "0 24px" }}>
                <table
                  width="100%"
                  cellPadding="24"
                  cellSpacing="0"
                  style={footer}
                >
                  <tr>
                    <td align="center">
                      <Text style={footerText}>
                        Complete payment to secure your booking!
                      </Text>
                      <Text style={footerTextSmall}>
                        Padel Batu Alam Permai
                        <br />
                        Samarinda, East Kalimantan
                      </Text>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (reuse from BookingConfirmation with modifications)
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#e9ff00 !important",
  width: "100%",
};

const h1 = {
  color: "#000000 !important",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 8px",
  padding: "0",
  textAlign: "center" as const,
};

const headerText = {
  color: "#2d6a4f !important",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  letterSpacing: "1px",
  textAlign: "center" as const,
};

const urgentBox = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  marginTop: "24px",
  marginBottom: "24px",
  width: "100%",
};

const urgentText = {
  color: "#92400e",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const bookingRefText = {
  color: "#374151",
  fontSize: "16px",
  margin: "0",
  textAlign: "center" as const,
};

const section = {
  padding: "0 24px",
  marginBottom: "16px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 8px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0",
};

const h2 = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const h3 = {
  color: "#111827",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  width: "40%",
  paddingBottom: "4px",
};

const detailValue = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "600",
  width: "60%",
  paddingBottom: "4px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 24px",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  width: "100%",
};

const listItem = {
  color: "#78350f",
  fontSize: "14px",
  lineHeight: "24px",
  paddingTop: "6px",
};

const smallText = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "8px 0 0",
};

const contactText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0 0",
};

const footer = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px 8px 0 0",
  width: "100%",
};

const footerText = {
  color: "#2d6a4f",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const footerTextSmall = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0",
  lineHeight: "20px",
  textAlign: "center" as const,
};

const ctaBox = {
  backgroundColor: "#eff6ff", // light blue
  border: "2px solid #3b82f6",
  borderRadius: "8px",
  width: "100%",
};

const ctaButton = {
  display: "inline-block",
  padding: "12px 32px",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "16px",
};

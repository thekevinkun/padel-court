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
import { BookingConfirmationEmailProps } from "@/types/email";

export default function BookingConfirmationEmail({
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
  remainingBalance,
  paymentMethod,
}: BookingConfirmationEmailProps) {
  // Get logos
  const logoUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/logos/logo-black.webp`;

  return (
    <Html>
      <Head />
      <Preview>Your Padel Court Booking is Confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <table width="100%" cellPadding="0" cellSpacing="0" style={header}>
            <tr>
              <td align="center" style={{ padding: "32px 24px" }}>
                <Img
                  src={logoUrl}
                  alt="Padel Batu Alam Permai"
                  width="180"
                  height="auto"
                  style={{ margin: "0 auto 16px" }}
                />
                <Heading style={h1}>Booking Confirmed!</Heading>
                <Text style={headerText}>PADEL BATU ALAM PERMAI</Text>
              </td>
            </tr>
          </table>

          {/* Success Message */}
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tr>
              <td style={{ padding: "0 24px" }}>
                <table
                  width="100%"
                  cellPadding="16"
                  cellSpacing="0"
                  style={successBox}
                >
                  <tr>
                    <td align="center">
                      <Text style={successText}>✅ Payment Successful</Text>
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
              Thank you for booking with us! Your court reservation has been
              confirmed.
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
            </table>
          </Section>

          <Hr style={hr} />

          {/* Payment Summary */}
          <Section style={section}>
            <Heading style={h2}>Payment Summary</Heading>

            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ marginTop: "16px" }}
            >
              {requireDeposit ? (
                <>
                  <tr>
                    <td style={detailLabel}>Deposit Paid:</td>
                    <td style={detailValue}>
                      IDR {depositAmount?.toLocaleString("id-ID")}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...detailLabel, paddingTop: "12px" }}>
                      <strong>Balance at Venue:</strong>
                    </td>
                    <td
                      style={{
                        ...detailValue,
                        color: "#f59e0b",
                        fontWeight: "bold",
                        paddingTop: "12px",
                      }}
                    >
                      IDR {remainingBalance?.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td style={detailLabel}>
                    <strong>Total Paid:</strong>
                  </td>
                  <td
                    style={{
                      ...detailValue,
                      color: "#10b981",
                      fontWeight: "bold",
                    }}
                  >
                    IDR {totalAmount.toLocaleString("id-ID")}
                  </td>
                </tr>
              )}
            </table>

            <Text style={smallText}>
              Payment Method: {paymentMethod.toUpperCase()}
            </Text>

            {requireDeposit && (
              <table
                width="100%"
                cellPadding="12"
                cellSpacing="0"
                style={{ ...warningBox, marginTop: "16px" }}
              >
                <tr>
                  <td>
                    <Text style={warningText}>
                      ⚠️ Please pay the remaining balance when you arrive at the
                      venue.
                    </Text>
                  </td>
                </tr>
              </table>
            )}
          </Section>

          <Hr style={hr} />

          {/* Important Reminders */}
          <Section style={section}>
            <table
              width="100%"
              cellPadding="16"
              cellSpacing="0"
              style={reminderBox}
            >
              <tr>
                <td>
                  <Heading style={h3}>⚠️ Important Reminders</Heading>
                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ marginTop: "8px" }}
                  >
                    <tr>
                      <td style={listItem}>
                        • Please arrive <strong>10 minutes before</strong> your
                        scheduled time
                      </td>
                    </tr>
                    <tr>
                      <td style={listItem}>
                        • Show this email or booking reference at reception
                      </td>
                    </tr>
                    <tr>
                      <td style={listItem}>
                        • Cancellation must be made{" "}
                        <strong>24 hours in advance</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style={listItem}>
                        • Late arrivals may result in reduced playing time
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* View Booking Online */}
          <Section style={section}>
            <table width="100%" cellPadding="16" cellSpacing="0" style={ctaBox}>
              <tr>
                <td align="center">
                  <Heading style={h3}>📱 View Your Booking Online</Heading>
                  <Text
                    style={{
                      ...paragraph,
                      marginTop: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    Access your booking details anytime, anywhere:
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
            <Text style={paragraph}>
              Need to make changes or have questions?
            </Text>
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
                      <Text style={footerText}>See you on the court!</Text>
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

// Styles
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
  backgroundColor: "#e9ff00", // Primary yellow
  width: "100%",
};

const h1 = {
  color: "#000000", // Black text
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 8px",
  padding: "0",
  textAlign: "center" as const,
};

const headerText = {
  color: "#2d6a4f", // Forest green
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  letterSpacing: "1px",
  textAlign: "center" as const,
};

const successBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #10b981",
  borderRadius: "8px",
  marginTop: "24px",
  marginBottom: "24px",
  width: "100%",
};

const successText = {
  color: "#10b981",
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

const reminderBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  width: "100%",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  width: "100%",
};

const warningText = {
  color: "#78350f",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
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

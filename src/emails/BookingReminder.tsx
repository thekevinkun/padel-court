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
import { BookingReminderEmailProps } from "@/types/email";

export default function BookingReminderEmail({
  customerName,
  customerEmail,
  bookingRef,
  courtName,
  date,
  time,
  requireDeposit,
  remainingBalance,
  venuePaymentReceived,
  logoUrl,
}: BookingReminderEmailProps) {
  const needsPayment =
    requireDeposit &&
    !venuePaymentReceived &&
    remainingBalance &&
    remainingBalance > 0;

  return (
    <Html>
      <Head />
      <Preview>Your Padel session is coming up soon!</Preview>
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
                <Heading style={h1}>Session Reminder</Heading>
                <Text style={headerText}>YOUR BOOKING IS COMING SOON!</Text>
              </td>
            </tr>
          </table>

          {/* Main Message */}
          <Section style={section}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={paragraph}>
              This is a friendly reminder that your Padel court session is
              <strong> coming up soon</strong>!
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Booking Details */}
          <Section style={section}>
            <table
              width="100%"
              cellPadding="16"
              cellSpacing="0"
              style={highlightBox}
            >
              <tr>
                <td>
                  <Heading style={h2}>Your Session Details</Heading>

                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ marginTop: "12px" }}
                  >
                    <tr>
                      <td style={detailLabel}>Booking Ref:</td>
                      <td style={detailValue}>{bookingRef}</td>
                    </tr>
                    <tr>
                      <td style={{ ...detailLabel, paddingTop: "12px" }}>
                        Court:
                      </td>
                      <td style={{ ...detailValue, paddingTop: "12px" }}>
                        {courtName}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...detailLabel, paddingTop: "12px" }}>
                        Date:
                      </td>
                      <td style={{ ...detailValue, paddingTop: "12px" }}>
                        {date}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...detailLabel, paddingTop: "12px" }}>
                        Time:
                      </td>
                      <td style={{ ...detailValue, paddingTop: "12px" }}>
                        {time}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* Payment Warning if needed */}
          {needsPayment && (
            <>
              <Hr style={hr} />
              <Section style={section}>
                <table
                  width="100%"
                  cellPadding="16"
                  cellSpacing="0"
                  style={warningBox}
                >
                  <tr>
                    <td>
                      <Heading style={h3}>Payment Required at Venue</Heading>
                      <Text style={warningText}>
                        Please bring{" "}
                        <strong>
                          IDR {remainingBalance?.toLocaleString("id-ID")}
                        </strong>{" "}
                        to complete your payment at the venue.
                      </Text>
                      <Text style={smallText}>
                        Cash, debit card, or bank transfer accepted.
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>
            </>
          )}

          <Hr style={hr} />

          {/* Checklist */}
          <Section style={section}>
            <Heading style={h2}>✅ Before You Come</Heading>
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ marginTop: "8px" }}
            >
              <tr>
                <td style={listItem}>
                  • Arrive <strong>10 minutes early</strong>
                </td>
              </tr>
              <tr>
                <td style={listItem}>
                  • Bring your booking reference: <strong>{bookingRef}</strong>
                </td>
              </tr>
              {needsPayment && (
                <tr>
                  <td style={listItem}>
                    • Prepare payment:{" "}
                    <strong>
                      IDR {remainingBalance?.toLocaleString("id-ID")}
                    </strong>
                  </td>
                </tr>
              )}
              <tr>
                <td style={listItem}>• Wear appropriate sports attire</td>
              </tr>
              <tr>
                <td style={listItem}>• Bring water and towel</td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* View Booking Online */}
          <Section style={section}>
            <table width="100%" cellPadding="16" cellSpacing="0" style={ctaBox}>
              <tr>
                <td align="center">
                  <Heading style={h3}>📱 View Your Booking</Heading>
                  <Text
                    style={{
                      ...paragraph,
                      marginTop: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    Check your booking details or make changes:
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

          {/* Contact */}
          <Section style={section}>
            <Text style={paragraph}>Need to cancel or reschedule?</Text>
            <Text style={contactText}>
              📱 WhatsApp: +62 812 3955 3510
              <br />
              📧 Email: info@padelbap.com
            </Text>
            <Text style={smallText}>
              Cancellations must be made at least 24 hours in advance.
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
                      <Text style={footerText}>Looking forward to seeing you on the court!</Text>
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

const section = {
  padding: "0 24px",
  margin: "16px 0",
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

const highlightBox = {
  backgroundColor: "#f0f9ff",
  border: "2px solid #3b82f6",
  borderRadius: "8px",
  width: "100%",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  width: "100%",
};

const warningText = {
  color: "#78350f",
  fontSize: "16px",
  fontWeight: "600",
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

const listItem = {
  color: "#374151",
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
  backgroundColor: "#eff6ff",
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

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
import { RefundConfirmationEmailProps } from "@/types/email";

export default function RefundConfirmationEmail({
  customerName,
  bookingRef,
  courtName,
  date,
  time,
  originalAmount,
  refundAmount,
  refundMethod,
  refundReason,
  logoUrl,
}: RefundConfirmationEmailProps) {
  // Calculate refund timeline based on method
  const getRefundTimeline = (method: string) => {
    switch (method) {
      case "MIDTRANS":
        return "3-7 business days to your original payment method";
      case "MANUAL_TRANSFER":
        return "1-3 business days to your bank account";
      case "CASH":
        return "Immediately at venue";
      case "STORE_CREDIT":
        return "Immediately available as store credit";
      default:
        return "As per our refund policy";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Your refund has been processed - {bookingRef}</Preview>
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
                <Heading style={h1}>Refund Processed</Heading>
                <Text style={headerText}>YOUR REFUND HAS BEEN CONFIRMED</Text>
              </td>
            </tr>
          </table>

          {/* Refund Confirmation Box */}
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tr>
              <td style={{ padding: "0 24px" }}>
                <table
                  width="100%"
                  cellPadding="16"
                  cellSpacing="0"
                  style={refundBox}
                >
                  <tr>
                    <td align="center">
                      <Text style={refundText}>✅ Refund Confirmed</Text>
                      <Text style={bookingRefText}>
                        Booking Ref: <strong>{bookingRef}</strong>
                      </Text>
                      <Hr style={{ ...hr, margin: "16px 0" }} />
                      <Text style={amountText}>
                        IDR {refundAmount.toLocaleString("id-ID")}
                      </Text>
                      <Text style={smallText}>will be refunded to you</Text>
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
              We've processed your refund request for your Padel court booking.
              We're sorry we couldn't accommodate your session and hope to see
              you again soon.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Original Booking Details */}
          <Section style={section}>
            <Heading style={h2}>Cancelled Booking Details</Heading>

            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ marginTop: "16px" }}
            >
              <tr>
                <td style={detailLabel}>Booking Ref:</td>
                <td style={detailValue}>{bookingRef}</td>
              </tr>
              <tr>
                <td style={{ ...detailLabel, paddingTop: "12px" }}>Court:</td>
                <td style={{ ...detailValue, paddingTop: "12px" }}>
                  {courtName}
                </td>
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
                <td style={{ ...detailLabel, paddingTop: "12px" }}>
                  Original Amount:
                </td>
                <td style={{ ...detailValue, paddingTop: "12px" }}>
                  IDR {originalAmount.toLocaleString("id-ID")}
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Refund Details */}
          <Section style={section}>
            <table
              width="100%"
              cellPadding="16"
              cellSpacing="0"
              style={infoBox}
            >
              <tr>
                <td>
                  <Heading style={h2}>Refund Information</Heading>

                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ marginTop: "12px" }}
                  >
                    <tr>
                      <td style={detailLabel}>Refund Amount:</td>
                      <td
                        style={{
                          ...detailValue,
                          color: "#10b981",
                          fontWeight: "bold",
                        }}
                      >
                        IDR {refundAmount.toLocaleString("id-ID")}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...detailLabel, paddingTop: "12px" }}>
                        Refund Method:
                      </td>
                      <td style={{ ...detailValue, paddingTop: "12px" }}>
                        {refundMethod === "MIDTRANS" &&
                          "Original Payment Method"}
                        {refundMethod === "MANUAL_TRANSFER" && "Bank Transfer"}
                        {refundMethod === "CASH" && "Cash Refund"}
                        {refundMethod === "STORE_CREDIT" &&
                          "Store Credit/Voucher"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...detailLabel, paddingTop: "12px" }}>
                        Processing Time:
                      </td>
                      <td style={{ ...detailValue, paddingTop: "12px" }}>
                        {getRefundTimeline(refundMethod)}
                      </td>
                    </tr>
                    {refundReason && (
                      <tr>
                        <td style={{ ...detailLabel, paddingTop: "12px" }}>
                          Reason:
                        </td>
                        <td style={{ ...detailValue, paddingTop: "12px" }}>
                          {refundReason}
                        </td>
                      </tr>
                    )}
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* What Happens Next */}
          <Section style={section}>
            <Heading style={h2}>What Happens Next?</Heading>
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ marginTop: "8px" }}
            >
              {refundMethod === "MIDTRANS" && (
                <>
                  <tr>
                    <td style={listItem}>
                      1. Your refund will be processed to your{" "}
                      <strong>original payment method</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={listItem}>
                      2. Processing time: <strong>3-7 business days</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={listItem}>
                      3. You'll see the credit in your bank statement as
                      "REFUND - PADEL BAP"
                    </td>
                  </tr>
                </>
              )}
              {refundMethod === "MANUAL_TRANSFER" && (
                <>
                  <tr>
                    <td style={listItem}>
                      1. Our team will contact you to confirm your bank account
                      details
                    </td>
                  </tr>
                  <tr>
                    <td style={listItem}>
                      2. Transfer will be processed within{" "}
                      <strong>1-3 business days</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={listItem}>
                      3. You'll receive a transfer confirmation
                    </td>
                  </tr>
                </>
              )}
              {refundMethod === "CASH" && (
                <>
                  <tr>
                    <td style={listItem}>
                      1. Visit our venue during operating hours
                    </td>
                  </tr>
                  <tr>
                    <td style={listItem}>2. Show this email and your ID</td>
                  </tr>
                  <tr>
                    <td style={listItem}>3. Collect your cash refund</td>
                  </tr>
                </>
              )}
              {refundMethod === "STORE_CREDIT" && (
                <>
                  <tr>
                    <td style={listItem}>
                      1. Your store credit is{" "}
                      <strong>immediately available</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={listItem}>2. Use it for your next booking</td>
                  </tr>
                  <tr>
                    <td style={listItem}>
                      3. Contact us to redeem: +62 812 3955 3510
                    </td>
                  </tr>
                </>
              )}
            </table>
          </Section>

          <Hr style={hr} />

          {/* Book Again CTA */}
          <Section style={section}>
            <table width="100%" cellPadding="16" cellSpacing="0" style={ctaBox}>
              <tr>
                <td align="center">
                  <Heading style={h3}>We'd Love to See You Again!</Heading>
                  <Text
                    style={{
                      ...paragraph,
                      marginTop: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    Book your next session and enjoy Padel at Batu Alam Permai
                  </Text>
                  <a
                    href={`${process.env.NEXT_PUBLIC_SITE_URL}`}
                    style={ctaButton}
                  >
                    Book Another Session →
                  </a>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Contact Info */}
          <Section style={section}>
            <Text style={paragraph}>Questions about your refund?</Text>
            <Text style={contactText}>
              📱 WhatsApp: +62 812 3955 3510
              <br />
              📧 Email: info@padelbap.com
            </Text>
            <Text style={smallText}>
              Quote your booking reference: <strong>{bookingRef}</strong>
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
                        Thank you for your understanding 🙏
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
  color: "#000000",
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

const refundBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #10b981",
  borderRadius: "8px",
  marginTop: "24px",
  marginBottom: "24px",
  width: "100%",
};

const refundText = {
  color: "#10b981",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const bookingRefText = {
  color: "#374151",
  fontSize: "14px",
  margin: "0",
  textAlign: "center" as const,
};

const amountText = {
  color: "#10b981",
  fontSize: "36px",
  fontWeight: "bold",
  margin: "8px 0 4px",
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

const infoBox = {
  backgroundColor: "#eff6ff",
  border: "1px solid #3b82f6",
  borderRadius: "8px",
  width: "100%",
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

const ctaBox = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  width: "100%",
};

const ctaButton = {
  display: "inline-block",
  padding: "12px 32px",
  backgroundColor: "#2d6a4f",
  color: "#ffffff",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "16px",
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

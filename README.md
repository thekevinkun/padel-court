# Padel Batu Alam Permai — Court Booking System

A full-stack, production-ready padel court booking and management system built for **Batu Alam Permai** venue. Customers can browse courts, book time slots, pay online, and manage their bookings — while admins get a powerful real-time dashboard to run the entire operation.

🌐 **Live:** [padelbatualampermai.vercel.app](https://padelbatualampermai.vercel.app)

<img width="1920" height="988" alt="padel batu alam permai - homepage" src="https://github.com/user-attachments/assets/fad6efd8-57d1-4e0c-a5cd-4e6f15537aa4" /><br>

<img width="1920" height="1608" alt="padel batu alam permai - dashboard page" src="https://github.com/user-attachments/assets/dc8d2545-0bbe-42e6-bb59-87682d8fdce9" />

---

## 🎯 Overview

This is not a simple CRUD app. It's a complete business system covering the full lifecycle of a padel court booking — from browsing and payment, to session check-in, refunds, reminders, and analytics. Every feature was built with real operational needs in mind.

---

## ❗Disclaimer
All venue photos, court images, and visual assets used in this project are AI-generated and intended solely as placeholders for demonstration purposes. They do not represent the actual facilities of Padel Batu Alam Permai.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Real-time** | Supabase Realtime (WebSockets) |
| **Payments** | Midtrans (Indonesian payment gateway) |
| **Email** | Resend + React Email |
| **Rate Limiting** | Upstash Redis |
| **Animations** | Framer Motion |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel |
| **Cron Jobs** | Vercel Cron |

---

## ✨ Features

### 🌐 Public-Facing Website

A fully animated, CMS-driven homepage built for conversion and brand identity:

- **Hero Section** — Full-screen with a primary booking CTA
- **Courts Section** — Court cards with lightbox viewer, specs, and pricing
- **Coaches Section** — Coach profiles with lightbox showing bio, specialties, certifications, and Instagram links
- **Pricing Section** — Peak/off-peak pricing with clear breakdowns
- **Gallery Section** — Masonry-style grid with full-screen lightbox, keyboard navigation, download, and thumbnail strip
- **Testimonials Section** — Auto-scrolling carousel with parallax effects, video/image support and star ratings
- **CTA Section** — Booking call-to-action with parallax effects and WhatsApp integration
- **PWA Ready** — Custom logo, favicon set, and `site.webmanifest` for installable web app

### 📅 Booking System

A multi-step booking flow designed for real court operations:

- **Multi-Slot Booking** — Book 1 to 3 contiguous hours in a single transaction
- **Real-time Slot Availability** — Time slots update live via WebSocket; no stale data
- **Atomic Slot Locking** — Slots are locked transactionally on booking creation to prevent race conditions
- **Equipment Rental** — Add racket rentals (Standard IDR 30K / Premium IDR 60K per session) during booking
- **Player Management** — Track up to 4 players per booking with optional guest contact details
- **Deposit System** — 50% deposit of (court + equipment) collected on booking
- **Booking Lifecycle:**
  ```
  PENDING → PAID → IN_PROGRESS → COMPLETED
                ↓             ↓
           CANCELLED      REFUNDED
                ↓
           EXPIRED
  ```

### 💳 Payment System (Midtrans)

- Full Midtrans integration supporting: Credit Card, QRIS, Bank Transfer, GoPay, DANA, and more
- **Payment Recovery** — Customers who lose the payment page can resume payment via their booking reference
- **Webhook Handler** — Processes payment success, failure, and expiry events with proper status transitions
- **Payment on Cancelled Booking** — Edge case handled: auto-refund initiated and admin notified
- **Venue Payment** — Admin can record cash payments made at the venue for walk-in customers
- **Payment Receipts** — Customers receive email + PDF receipt with full payment breakdown

### 📧 Email System (Resend + React Email)

Professional, branded HTML email templates:

- **Booking Confirmation** — Sent on payment success with booking ref, court, time, equipment, and players
- **Booking Reminder** — Sent automatically before sessions (via cron job)
- **Cancellation Confirmation** — Includes refund policy info (Full / Partial / None based on timing)
- **Refund Confirmation** — Sent when admin processes a refund
- **Venue Payment Confirmation** — Sent when admin records cash payment
- **Resend Email** — Customers can re-request confirmation from their "My Booking" page

### 🔍 Customer Self-Service ("My Booking")

Customers don't need an account — they just need their email and booking reference:

- Full booking details, payment summary, and session status
- **PDF Receipt Download** — Available for PAID and REFUNDED bookings only
- **WhatsApp Sharing** — Share booking details via WhatsApp
- **Resend Email** — Re-trigger confirmation email from the page
- **Self-Service Cancellation** — Customers can cancel bookings within the allowed policy window
- **24-Hour Success Page Expiry** — Booking success pages expire after 24 hours and redirect to My Booking (prevents fake receipt abuse)

### 🔐 Security

This system went through a dedicated **pre-deployment security audit** covering 6 phases before going live. Here's what was hardened:

#### Phase 1 — Critical Payment Security 🔴

**Webhook Signature Verification**
Every incoming Midtrans webhook is verified using SHA-512 signature before any database operation. Without this, anyone could POST a fake payment confirmation and mark a booking as PAID for free.
```
SHA-512(orderId + statusCode + grossAmount + serverKey) === signature_key
```

**Payment Amount Verification**
After fetching the booking, the gross amount from Midtrans is compared against the expected `total_amount` in the database. Any mismatch immediately creates a `PAYMENT_FRAUD_ATTEMPT` admin notification and rejects the webhook. Without this, a user could pay IDR 1 and claim an IDR 950,000 court.

**Webhook Idempotency / Replay Protection**
Midtrans sends the same webhook multiple times. A `processed_webhooks` table deduplicates events so the same payment notification is never processed twice.

A critical bug was found and fixed during this phase: the initial idempotency key used `transaction_id` alone. This caused the `SETTLEMENT` webhook to be blocked because the `PENDING` webhook had already stored that key — making a real payment look like it never happened. The fix: use `transaction_id + transaction_status` as the composite key so each status transition is treated as a unique event.

#### Phase 2 — Database-Level Protection 🟠

**Booking State Machine** (`src/lib/booking-state-machine.ts`)
Before this, each route had its own scattered `if/else` checks for valid status transitions — some missing `EXPIRED`, others missing `REFUNDED`. A late Midtrans webhook could theoretically mark an already-EXPIRED booking as PAID.

A centralized state machine was created as the single source of truth for all valid transitions:
```
PENDING  → PAID, CANCELLED, EXPIRED
PAID     → CANCELLED, REFUNDED
CANCELLED → (terminal — no further transitions)
EXPIRED  → (terminal — no further transitions)
REFUNDED → (terminal — no further transitions)
```
Applied to 4 routes: webhook, cancel-failed, cancel-customer, and admin cancel. Adding a new status in the future requires changing exactly one file.

**Cron Auto-Complete Query Fix**
The `update-statuses` cron was missing a `.eq('status', 'PAID')` filter on the auto-complete loop. A booking with `status = CANCELLED` but `session_status = IN_PROGRESS` (broken data state) could have been accidentally auto-completed.

#### Phase 3 — Cron Hardening
Completed as a byproduct of Phase 1 and 2 — no additional work needed. DB query filters act as the guard: if the query only returns `PAID + UPCOMING` rows, no cancelled booking can be accidentally processed.

#### Phase 4 — Authorization & Access Control
- **Admin routes** — Every admin endpoint verifies Supabase Auth session + role check before any operation
- **Customer ownership verification** — The cancel endpoint uses a three-way match: `bookingId + customer_email + booking_ref` simultaneously. An attacker must know all three to cancel a booking
- **`cancel-failed` format validation** — This public browser-facing endpoint now validates `bookingRef` matches `/^BAP\d+$/` before touching the database, preventing injection probing
- **Non-sequential IDs** — UUIDs for booking IDs, `BAP+timestamp` for booking refs (no enumerable sequences)

#### Phase 5 — Monitoring & Stuck Booking Handling
- **Stuck PENDING Expiry** — If Midtrans never sends a webhook (network failure, etc.), a cron loop finds PENDING bookings older than 24 hours, marks them EXPIRED, releases their slots, and notifies the admin
- **Cron Health Check Notification** — After every cron run, a `SYSTEM` notification is written to `admin_notifications` with a summary of what was processed — an audit trail proving the cron is actually running in production

#### Always-On Security
- **Row-Level Security (RLS)** — All Supabase tables protected. `processed_webhooks` and `booking_idempotency` locked to `service_role` only
- **Atomic Slot Locking** — `.eq('available', true)` on the slot update acts as a database-level race condition guard. Only one concurrent request wins; the second gets 0 rows back and a 409
- **Rate Limiting (Upstash Redis, sliding window algorithm):**
  - Booking creation: 5/hour per IP, 3/day per email
  - Payment creation: 10/hour per IP
  - Booking lookup: 20/hour per IP
  - Payment cancel: 10/hour per IP
- **Booking Success Page Access Control** — 24-hour expiry + PAID status required; prevents fake receipt generation
- **IP Detection** — Supports `X-Forwarded-For` and `CF-Connecting-IP` for proxy/CDN environments
- **Cron Secret Verification** — All cron endpoints protected with `CRON_SECRET`

### 🖥️ Admin Dashboard

A complete operations center for venue management:

#### Real-Time Dashboard
- Live stats cards: Today's Bookings, Today's Revenue, In-Progress Sessions, Upcoming, Completed, Available Slots
- Recent bookings list (top 5) updates automatically without page refresh
- Powered by Supabase Realtime via PostgreSQL logical replication

#### Sound Notifications
- Audio alerts for: New Booking 🔔, Payment Received 💰, Payment Failed ❌, Cancellation 🚫
- Per-admin controls: enable/disable toggle, volume slider, test buttons
- Settings persist in localStorage

#### Bell Notifications Panel
- Slide-in panel with unread count badge
- Mark as read/unread, delete, navigate to related booking
- Grouped by date: Today, Yesterday, This Week, Older
- Cross-tab synchronization (mark read in one tab → updates all)
- Notification types: `NEW_BOOKING`, `PAYMENT_RECEIVED`, `PAYMENT_FAILED`, `CANCELLATION`

#### Bookings Management
- Paginated bookings list (12 per page) with search and filters
- Filters: court, date range, booking status, session status, payment method
- Booking detail view with full timeline, player list, equipment, and payment summary
- **Admin Check-In/Check-Out** — Manually start and complete sessions
- **Manual Refund Processing** — With multiple methods: Midtrans, Bank Transfer, Cash, Store Credit
- **Admin-Blocked Slots** — Block specific time slots without affecting existing bookings

#### CMS (Content Management System)
All homepage content is fully editable without touching code:
- Section headers (badge, heading, description)
- Courts — add/edit/delete courts with images, specs, pricing, and features
- Coaches — add/edit/delete coach profiles with photo, bio, specialties, certifications
- Gallery — manage up to 9 images with captions and alt text
- Testimonials — add/edit/delete with video/image support and star ratings
- CTA Section — edit heading, subtext, WhatsApp number
- Every change is saved with **version history** and triggers **ISR revalidation**

#### Reports & Analytics
A business intelligence system built for padel court owners:

- **Date range picker** with presets (Today, 7 Days, 30 Days, Custom)
- **Key Metrics:** Gross Revenue, Actual Earnings (after fees & refunds), Total Bookings, Completion Rate, Cancellation Rate, Avg Booking Value
- **Revenue Breakdown:** Court Revenue vs Equipment Revenue, Online vs Venue payments, Partial refund tracking
- **Revenue Timeline Chart** — Court + Equipment revenue lines over time
- **Court Performance** — Best/worst performing courts, utilization rates
- **Peak vs Off-Peak Analysis** — Revenue by time of day
- **Equipment & Player Analytics** — Rental rate %, popular equipment chart, avg players per booking
- **Period Comparison** — Side-by-side table comparing current vs previous period with ↑↓ indicators
- **Business Recommendations** — AI-style actionable insights (color-coded: ⚠️ Warning, 💡 Opportunity, ✅ Success) with priority badges (HIGH / MEDIUM / LOW)
- **CSV Export** — Executive summary, detailed bookings, revenue breakdown

### ⏰ Automated Cron Jobs (Vercel Cron)

- **Booking Reminder Emails** — Automatically sends reminder emails before upcoming sessions
- **Session Status Updates** — Auto-transitions bookings from UPCOMING → IN_PROGRESS → COMPLETED based on time
- **Expired Payment Cleanup** — Auto-cancels PENDING bookings past the payment window and releases slots

### ⚡ Performance Optimization

- Lighthouse Performance Score: **86**
- Hero loads in **~0.3-0.5s**
- All images converted to **WebP** with proper sizing and quality presets
- Intelligent lazy loading strategy (above-fold: priority, below-fold: lazy)
- Blur placeholders for better perceived performance
- Code splitting with lazy-loaded dialogs and dynamic imports
- Bundle reduced by **~115KB** through optimized imports
- Font optimization with `next/font`
- Security headers configured
- Static asset caching

---

## 🗄️ Database Schema (Key Tables)

```
bookings          — Core booking records with full status tracking
time_slots        — Available court hours with admin_blocked support
booking_time_slots — Junction table for multi-slot bookings
booking_equipment — Junction table for equipment rentals
booking_players   — Guest/player tracking per booking
equipment         — Rental equipment catalog
payments          — Payment transaction records
admin_notifications — Real-time notification queue
content_sections  — CMS content for all homepage sections
site_settings     — Configurable business rules (refund policy, max hours, etc.)
```

---

## 🔄 Booking Lifecycle & Slot Management

Time slot availability is derived dynamically from booking state — not stored as a simple boolean:

```
Available  → admin_blocked = false AND no active bookings
Booked     → has PENDING/PAID booking with non-completed session
Admin Blocked → admin_blocked = true (can coexist with bookings)
```

Slots automatically unlock on: checkout, auto-complete, cancellation, refund, expired payment, and manual DB deletion (via PostgreSQL trigger).

---

## 📦 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Resend (Email)
RESEND_API_KEY=
EMAIL_USER=

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Rate Limit Config
RATE_LIMIT_BOOKING_PER_IP=5
RATE_LIMIT_BOOKING_PER_EMAIL=3
RATE_LIMIT_PAYMENT_PER_IP=10
RATE_LIMIT_LOOKUP_PER_IP=20

# Vercel Cron
CRON_SECRET=

# App URLs
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SITE_URL=
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/padel-batu-alam-permai.git
cd padel-batu-alam-permai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

Admin dashboard is at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel — set project name to match your desired subdomain
3. Add all environment variables in Vercel project settings
4. Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to your production URL
5. After deploy, verify cron jobs appear under **Settings → Cron Jobs**
6. Update Midtrans webhook URL in Midtrans dashboard:
   ```
   https://yourdomain.com/api/payments/webhook
   ```

> **Note:** Vercel Hobby plan supports daily cron jobs only. Upgrade to Pro for sub-daily cron frequency.

---

## 🏗️ Architecture Highlights

### Two-Tier Real-time System
```
Tier 1 (Global) — NotificationsProvider wraps entire admin layout
                  Subscribes to: admin_notifications table
                  Always active across all admin pages

Tier 2 (On-Demand) — useRealtimeBookings hook
                      Subscribes to: bookings table
                      Only active when on /admin/bookings page
```

### Real-time Flow
```
Customer Action (Book/Pay)
        ↓
API Route → Updates Database
        ↓
PostgreSQL Logical Replication
        ↓
Supabase Realtime (WebSocket broadcast)
        ↓
React Context → Recalculate Stats + Play Sound + Toast + Update UI
```

### Revenue Calculation Logic
```
Gross Revenue   = Court Revenue + Equipment Revenue
Actual Earnings = Gross Revenue - Payment Fees - Refunds
Online Kept     = (deposit_amount OR total_amount) - refund_amount
Venue Kept      = venue_payment_received ? venue_payment_amount : 0
Total Kept      = Online Kept + Venue Kept
```

---

## 📋 Refund Policy System

Configurable refund tiers (stored in `site_settings`, editable by admin without code changes):

| Cancellation Timing | Refund |
|---|---|
| > 24 hours before session | Full refund |
| 12–24 hours before session | 50% partial refund |
| < 12 hours before session | No refund |

---

## 📸 Screenshots

1. Dashboard Page

   <img width="1920" height="1608" alt="padel batu alam permai - dashboard page" src="https://github.com/user-attachments/assets/c933d1d1-b4f0-423d-9dda-5dfed6b9a0a4" /><br >

2. Booking Success Page

   <img width="1920" height="2097" alt="padel batu alam permai - booking success page" src="https://github.com/user-attachments/assets/b902c603-d32e-4568-b78f-3350a60c75b1" /><br >

3. Booking Confirmed Email

   <img width="1920" height="2851" alt="padel batu alam permai - booking confirmed email" src="https://github.com/user-attachments/assets/80a26175-9ff6-4a2f-a571-0a5bfd52b1b2" /><br >

4. My Booking

   <img width="1920" height="2555" alt="padel batu alam permai - my booking" src="https://github.com/user-attachments/assets/a0fa78de-54c8-4a11-9315-01cda960b895" /><br >

5. Dashboard Booking Page

   <img width="1920" height="1900" alt="padel batu alam permai - dashboard booking page" src="https://github.com/user-attachments/assets/591786f1-16ce-4f60-8d33-e6e334f2eca1" /><br >

6. Dashboard Customer Booking Detail

   <img width="1920" height="2790" alt="padel batu alam permai - dashboard customer booking detail" src="https://github.com/user-attachments/assets/3084fe48-4d3a-461d-8937-f859c7f11fe6" /><br >

7. Dashboard Reports Page

   <img width="1920" height="12757" alt="padel batu alam permai - dashboard reports page" src="https://github.com/user-attachments/assets/01c4b44c-822d-49fd-9ee0-996411e3ef4c" /><br >

8. Dashboard Time Slots Page

   <img width="1920" height="1657" alt="padel batu alam permai - dashboard time slots page" src="https://github.com/user-attachments/assets/d56788af-aa3c-4ce9-a21d-e84c9a49b711" /><br >

9. Dashboard Courts Page

   <img width="1920" height="1770" alt="padel batu alam permai - dashboard courts page" src="https://github.com/user-attachments/assets/34ce862b-b6a2-41f3-b8a9-6cb3c06b0c7d" /><br >

10. Dashboard Content Management System Page

    <img width="1920" height="9940" alt="padel batu alam permai - dashboard CMS page" src="https://github.com/user-attachments/assets/2d3dca55-fc50-4f7c-9ed6-ddaf4ec0961d" /><br >

11. Dashboard Settings Page

    <img width="1920" height="1087" alt="padel batu alam permai - dashboard settings page" src="https://github.com/user-attachments/assets/ad11255b-a2b8-4571-9f2a-94ef59bcda95" /><br >

---

## 🔮 Future Enhancements

- [ ] Custom domain + Resend verified sender email
- [ ] Customer accounts (optional account creation, booking history, rebook)
- [ ] Midtrans automatic refund API integration
- [ ] SMS notifications (Twilio / local Indonesian provider)
- [ ] Equipment inventory tracking (available quantity management)
- [ ] Loyalty/rewards system (points, tiers, referrals)
- [ ] Dynamic pricing engine
- [ ] Public testimonial submission form with admin approval

---

## 👨‍💻 Built By

**Kevin Mahendra**

- Email: [kevinmahendra.idn@gmail.com](mailto:kevinmahendra.idn@gmail.com)
- LinkedIn: [kevinmahendra1997](https://www.linkedin.com/in/kevinmahendra1997/)
- GitHub: [@thekevinkun](https://github.com/thekevinkun)
- Location: Samarinda, East Kalimantan, Indonesia

Built from scratch as a real-world full-stack project for an actual padel court venue in Indonesia. Every feature in this repo was shipped in response to a real operational need.

---

## 📄 License

This project is private and built for a specific venue. Not licensed for redistribution.

# Master Development Roadmap & Implementation Plan

This document establishes the step-by-step engineering roadmap for the Futsal Booking Platform. Development proceeds systematically across logical phases to ensure architectural integrity, testability, and continuous delivery.

---

## Phase 0: Project Foundation & Engineering Environment
- [x] Inspect development environment (Node.js LTS, Git, GitHub CLI).
- [x] Initialize Git repository with main branch.
- [x] Configure Vite + React 18 + TypeScript + Tailwind CSS stack.
- [x] Scaffold folder hierarchy (`/src/components`, `/src/pages`, `/src/context`, `/src/lib`, `/src/types`, `/src/services`, `/src/hooks`).
- [x] Configure `.env.example`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`.
- [x] Author all 10 permanent memory documentation files.
- [x] Scaffold Firebase architecture (`firebase.json`, `firestore.rules`, `firestore.indexes.json`, `functions/`).
- [ ] Install dependencies and verify development server & clean production build.
- [ ] Check GitHub remote connection & perform initial Git commit.

---

## Phase 1: Public Business Website & UI Foundations
- [ ] Implement responsive Layout (`Navbar`, `Footer`, `AnnouncementBar`).
- [ ] Build **Hero Section** with high-conversion "Book Your Slot" Call-to-Action.
- [ ] Build **About Us Section** highlighting FIFA-standard turf, floodlights, parking, and locker rooms.
- [ ] Build **Pitch Specifications & Services Section** (Court dimensions, boots allowed, amenities).
- [ ] Build **Interactive Gallery Section** showcasing court action, turf quality, and facilities.
- [ ] Build **Location & Map Section** with venue directions and contact placeholders.
- [ ] Build **Contact Us Section** with inquiry form and direct phone dialer.

---

## Phase 2: Sport Selection Interface
- [ ] Implement `/book` route for sport selection.
- [ ] Design **Football / Futsal Card** (Primary action, active status, direct slot finder).
- [ ] Design **Cricket Lane Card** (Coming Soon badge, notification prompt, disabled booking).
- [ ] Smooth transitions and responsive card layouts.

---

## Phase 3: Interactive Court Slot Booking Interface
- [ ] Design **Date Picker Calendar**:
  - Today selected by default.
  - Next 14–30 days selectable.
  - Disable past dates.
- [ ] Design **Hourly Court Slots Grid** (06:00 to 22:00):
  - **White (Neutral/Available):** Open for reservation with dynamic price badge (Rs. 1,300 or Rs. 1,500).
  - **Red (Unavailable/Booked):** Already booked or pending under review.
  - **Green (Customer's Own Confirmed):** Highlighted specifically for the signed-in user.
- [ ] Design **Slot Confirmation Modal**:
  - "Are you sure you want to book [Date] at [Time]?"
  - Explicit action buttons: "Confirm Request" vs "Cancel".

---

## Phase 4: Authentication & Customer Identity
- [ ] Firebase Google Sign-In integration (`signInWithPopup`).
- [ ] Profile Onboarding Flow:
  - Full Legal Name validation.
  - Valid Nepali Phone Number format (`98XXXXXXXX` / `97XXXXXXXX`).
  - Google Account Email association.
- [ ] Profile persistence in Firestore `/users/{uid}`.
- [ ] Customer account dropdown and profile dashboard.

---

## Phase 5: Booking & "Pay on Arrival" Lifecycle
- [ ] Order Summary display before submission (Sport, Date, Slot, Duration, Dynamic Price, Payment Method).
- [ ] "Pay on Arrival" order submission handler.
- [ ] Immediate slot locking to prevent race conditions.
- [ ] Customer Pending Review screen:
  - Clear guidance: "Your request has been submitted. Our venue manager will verify and may call your number to confirm."
  - Real-time status badge (`PENDING APPROVAL`).
- [ ] Customer Bookings list view with booking codes, dates, and live status.

---

## Phase 6: Firestore Engine & Security Enforcement
- [ ] Atomic slot reservations using Firestore Transactions / Batches.
- [ ] Server-side booking validation (date, pricing, slot availability).
- [ ] Deployment and verification of `firestore.rules`.
- [ ] Cryptographically unguessable booking code generator (e.g. `FT-9281`).
- [ ] Scheduled Cloud Function for pending booking timeout cleanup.

---

## Phase 7: Administrative Command Center
- [ ] Admin authentication and route guarding (`/admin/*`).
- [ ] **Admin Overview:** Live counters for Customers, Total Bookings, Pending, Confirmed, Revenue.
- [ ] **Waiting for Approval Queue:**
  - Fast-action card/table for pending requests.
  - Quick action: "Approve" (generates booking code, notifies customer, locks slot).
  - Quick action: "Reject" (prompts reason, frees slot immediately).
- [ ] **All Orders View:** Filterable table with search, status filters, and order detail drawer.
- [ ] **Manual / Offline Booking Desk:**
  - Date and slot selector for counter or phone reservations.
  - Input walk-in customer name and phone.
  - Atomic confirmation.
- [ ] Inspect slot details for any occupied time slot.

---

## Phase 8: Financial Analytics & Business Intelligence
- [ ] Real-time revenue computation (strictly confirmed/completed bookings).
- [ ] Timeframe breakdowns: Today, This Week, This Month, Custom Date Range, All-Time.
- [ ] Exportable CSV / summary reports for business owner.
- [ ] Peak hours utilization charts.

---

## Phase 9: Quality Assurance & Hardening
- [ ] Double-booking concurrency stress testing.
- [ ] Cross-device responsiveness (Mobile iOS/Android, Tablet, Desktop).
- [ ] Network offline/reconnection gracefully handled.
- [ ] Form input edge case validations.

---

## Phase 10: Vercel Deployment & Future Integrations
- [ ] Vercel deployment configuration (`vercel.json`, build commands, SPA rewrites).
- [ ] Custom domain DNS guidance.
- [ ] Production Firebase credentials binding.
- [ ] Architecture preparation for eSewa / Khalti payment gateway API.
- [ ] Architecture preparation for Cricket bookings.

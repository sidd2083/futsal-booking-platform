# Master Development Roadmap — Maya Sports Centre

## Phase 0: Foundation & Environment (Completed)
- [x] Node.js LTS v26.13.0, Git 2.56.0, GitHub CLI 2.103.3 verified.
- [x] React 18, Vite 5, TypeScript 5, Tailwind CSS 3 configured.
- [x] Repository initialized on main branch.
- [x] All 10 documentation files authored.

---

## Phase 1: Rebranding & Public Website Redesign (Completed)
- [x] Complete rebranding to **Maya Sports Centre** (Hetauda, Nepal).
- [x] Grounded marketing copy aligned with source of truth (quality grounds, maintained turf, floodlights, parking).
- [x] Integrated `Logo` component preserving natural dimensions with `/public/logo.png` binding.
- [x] Working Google Maps embed and **"Get Directions"** button linking to `C2FW+8VG, Rai Tole Marg, Hetauda`.
- [x] Clickable telephone link for `9714577877`.
- [x] Clean, modern, understated design eliminating artificial glows and unnecessary shapes.

---

## Phase 2: Sport Selection Gateway (Completed)
- [x] `/book` route with Football / Futsal active card (NPR 1,300 weekdays / NPR 1,500 Saturday).
- [x] Cricket practice nets card gracefully marked as Coming Soon.

---

## Phase 3: Booking System Repair (Completed)
- [x] Dynamically generated 11 one-hour slots between **10:00 AM and 9:00 PM**.
- [x] Strict 7-day rolling booking window in Nepal local time (`Asia/Kathmandu`).
- [x] Mandatory color-coded states: White (Available), Red (Booked), Green (Customer Confirmed), Amber (Under Review).
- [x] Confirmation modal with date, time, pricing, Pay on Arrival method, and Yes/No options.
- [x] Post-booking waiting room screen explaining phone verification.

---

## Phase 4: Authentication Repair (Completed)
- [x] **Option A — Continue with Google:** Popup sign-in with first-time full name and phone number capture into Firestore `/users/{uid}`.
- [x] **Option B — Email & Password Registration:** Full Name, Phone, Email, Password, Confirm Password validation and account creation via Firebase Auth.
- [x] Returning user login with Email/Password.
- [x] Centralized `AuthModal` integrated across navbar, booking confirmation, and booking ledger.

---

## Phase 5: Firebase & Firestore Backend (Completed)
- [x] Live Firebase project credentials (`futsal-2f004`) configured in `.env.local`.
- [x] Hardened `firestore.rules` supporting `/adminUsers`, `/users`, `/slots`, `/bookings`, `/settings`, and `/auditLogs`.
- [x] Atomic transactions for slot reservation preventing race conditions and double bookings.
- [x] Compound query indexes configured in `firestore.indexes.json`.

---

## Phase 6: Admin Panel & Dashboard Repair (Completed)
- [x] Dedicated staff login barrier at `/admin` (no hardcoded passwords in client code).
- [x] Role authorization verified against `/adminUsers/{uid}`.
- [x] Waiting for Approval queue with real pending bookings and one-tap customer dialer.
- [x] All Orders ledger with search, status filters, and audit drawer.
- [x] Offline / Counter Booking desk for walk-in and phone reservations (10 AM to 9 PM).
- [x] Revenue reports (Today, This Week, This Month, Custom Date Range, All-Time) calculated strictly from confirmed orders.

---

## Phase 7: Deployment & Business Handover (In Progress)
- [ ] Connect remote GitHub repository via `gh auth login`.
- [ ] Connect Vercel deployment with environment variables.
- [ ] Receive official logo image file at `/public/logo.png`.
- [ ] Receive business confirmation on pending booking expiration timeout policy.

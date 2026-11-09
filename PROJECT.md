# Project Overview — Futsal Booking Platform (Nepal)

## 1. Executive Summary

This project is a dedicated, production-grade web platform and reservation management system designed specifically for a local sports facility in Nepal providing commercial futsal courts (and planned cricket lanes).

Rather than serving merely as an informational brochure, this system handles the complete operational cycle:
- Public discovery, pitch specifications, and visual gallery.
- Real-time date and hourly court slot availability.
- Customer booking request submission with **Pay on Arrival** workflow.
- Immediate slot locking to prevent race conditions and double bookings.
- Administrative triage, order approval/rejection, and manual offline reservation entry.
- Customer account profiles, booking codes, and self-service confirmation tracking.
- Financial accounting, tracking actual realized revenue in Nepalese Rupees (NPR).

---

## 2. Business Objectives & Core Value

1. **Eliminate Double-Bookings:** Replace manual paper registers and fragmented phone/WhatsApp notes with an atomic, single-source-of-truth slot reservation engine.
2. **Empower Walk-Ins & Phone Callers (Offline Management):** Provide staff with an instant, friction-free manual booking desk to lock slots while talking to a customer on the phone or at the counter.
3. **Transparent Customer Experience:** Enable players to see real-time court availability 24/7 without having to repeatedly call the venue.
4. **Reliable Revenue Intelligence:** Calculate actual realized revenue separately from pending inquiries or cancellations.
5. **Future-Proof Scalability:** Architect clean hooks for future payment gateways (eSewa, Khalti, Fonepay), cricket lane reservations, and SMS/WhatsApp notifications.

---

## 3. Financial & Pricing Rules

- **Base Currency:** Nepalese Rupees (`NPR` / `Rs.`)
- **Initial Baseline Pricing:**
  - **Normal Days (Sunday – Friday):** NPR 1,300 per hour.
  - **Saturday (Peak Demand Day in Nepal):** NPR 1,500 per hour.
- **Dynamic Administrative Configuration:**
  - Pricing is **never hardcoded** in application logic.
  - System reads pricing rules from Firestore settings with fallback to environment defaults.
  - Future support for morning vs. prime-time evening peak pricing tiers.

---

## 4. Key Actors & User Roles

### A. Casual Visitors & Players (Customers)
- Browse venue information, pitch turf type, dimensions, amenities, and location.
- Select sport (Football / Futsal active; Cricket marked coming soon).
- Browse calendar dates and hourly slots.
- Authenticate via Google Sign-In with profile completion (Full Legal Name, Phone Number).
- Submit booking request via **Pay on Arrival**.
- Track booking status (`pending`, `confirmed`, `rejected`, `expired`).
- Present unique booking verification code (e.g. `FT-8492`) at the venue counter.

### B. Business Administrators & Court Managers (Admins)
- Authenticated via verified administrative privileges.
- Real-time dashboard showing key metrics:
  - Total registered customers
  - Total bookings breakdown (Pending, Confirmed, Rejected, Expired)
  - Daily, weekly, monthly, custom-range, and all-time revenue (calculated strictly on confirmed/completed bookings).
- Review pending booking queue: inspect customer name, phone number, requested date/time, and approve or reject.
- Create manual/offline bookings directly on the calendar grid for walk-in or phone reservations.
- View booking details and codes for any booked slot.

---

## 5. Scope & Phased Roadmap

| Phase | Milestone | Status |
| :--- | :--- | :--- |
| **Phase 0** | Foundation, Tooling, Scaffolding, Documentation, Git | **In Progress** |
| **Phase 1** | Public Business Website (Design System, Hero, About, Gallery, Location, Contact) | **Queued Next** |
| **Phase 2** | Sport Selection (Futsal Active, Cricket Coming Soon) | Queued |
| **Phase 3** | Slot Booking Interface (Calendar, Hourly Grid, Slot States, Modals) | Queued |
| **Phase 4** | Authentication & Customer Profile (Google Sign-In, Phone Verification Scaffolding) | Queued |
| **Phase 5** | Pay on Arrival Booking Workflow & Waiting States | Queued |
| **Phase 6** | Firestore Schema, Transactions, Atomic Slot Locks & Security Rules | Queued |
| **Phase 7** | Admin Dashboard (Overview, All Orders, Approval Queue, Manual Bookings) | Queued |
| **Phase 8** | Financial Reporting & Business Analytics | Queued |
| **Phase 9** | Production Optimization, Conflict Edge Cases, Auditing | Queued |
| **Phase 10** | Production Deployment (Vercel Frontend + Firebase Backend) | Queued |

---

## 6. Business Assumptions Requiring Owner Confirmation

The system uses safe, production-grade defaults, but the following business policies will be finalized with the owner:
1. **Operating Hours:** Default set to 06:00 AM – 10:00 PM (16 one-hour slots daily).
2. **Pending Slot Expiration Window:** Proposed 30 minutes before an unapproved pending slot automatically unlocks back to the public pool.
3. **Exact Venue Address & Contact Details:** Labeled clearly with clean placeholders until verified.
4. **Online Payment Merchant Gateway:** eSewa / Khalti integration deferred until merchant credentials and authorization are provided.

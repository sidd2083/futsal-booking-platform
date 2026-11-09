# Project Overview — Maya Sports Centre (Hetauda, Nepal)

## 1. Executive Summary

This project is the dedicated web platform and court reservation system for **Maya Sports Centre**, positioned as **Hetauda's No. 1 Sports Centre**. Located at Rai Tole Marg, Hetauda, Bagmati Province, Nepal, the facility provides well-maintained playing grounds, quality artificial turf, evening LED floodlighting, and convenient hourly court bookings.

The platform provides a complete, production-grade operational workflow:
- **Public Website:** Welcoming, grounded presentation of Maya Sports Centre, its facilities, location, and contact channels.
- **Dynamic 11-Slot Booking Grid:** Operating daily from **10:00 AM to 9:00 PM** across a strict 7-day rolling window in Nepal local time (Asia/Kathmandu).
- **Two Real Authentication Methods:** Google OAuth Sign-In and Email & Password registration/login with verified mobile phone number.
- **Pay on Arrival Workflow:** Instant pending reservation locking in Cloud Firestore to eliminate double bookings.
- **Administrative Command Center (`/admin`):** Separate staff login barrier, live pending approval queue, offline counter reservations, and strictly verified revenue calculations.

---

## 2. Business Information — Source of Truth

- **Business Name:** Maya Sports Centre
- **Physical Address:** `C2FW+8VG, Rai Tole Marg, Hetauda, Bagmati Province 44107, Nepal`
- **Contact Telephone:** `9714577877` (Clickable `tel:` link on mobile and desktop)
- **Google Maps Location:**  
  `https://www.google.com/maps/search/?api=1&query=C2FW%2B8VG%2C%20Rai%20Tole%20Marg%2C%20Hetauda%2C%20Bagmati%20Province%2044107`
- **Operating Schedule:** Every day, 10:00 AM – 9:00 PM (7 days a week)
- **Positioning:** Hetauda's No. 1 Sports Centre (communicated naturally without exaggeration)

---

## 3. Scope of Facilities & Marketing Tone

Maya Sports Centre promotes honest, confident marketing without fabricated claims:
- **Approved Facilities & Services:**
  1. Quality playing grounds.
  2. Well-maintained turf.
  3. LED floodlighting for evening games (up to 9:00 PM).
  4. On-site vehicle parking facilities.
  5. Affordable, transparent pricing.
  6. Open seven days a week.
  7. Convenient online reservation with Pay on Arrival.
- **Strict Exclusions:** No fabricated claims such as "FIFA-grade", "international-standard stadium", "world-class tournament certified", or invented awards.

---

## 4. Financial & Pricing Rules

- **Base Currency:** Nepalese Rupees (`NPR` / `Rs.`)
- **Hourly Booking Rates:**
  - **Sunday – Friday (Normal Days):** NPR 1,300 per hour.
  - **Saturday (Peak Day):** NPR 1,500 per hour.
- **Configurable Architecture:**
  - Rates are dynamically read from system settings with fallback to environment defaults.
  - Snapshot rates are preserved on each booking document for financial auditing accuracy.

---

## 5. Booking Schedule & Lifecycle

- **Operating Hours:** 10:00 AM to 9:00 PM (11 one-hour slots):
  1. `10:00 AM – 11:00 AM`
  2. `11:00 AM – 12:00 PM`
  3. `12:00 PM – 01:00 PM`
  4. `01:00 PM – 02:00 PM`
  5. `02:00 PM – 03:00 PM`
  6. `03:00 PM – 04:00 PM`
  7. `04:00 PM – 05:00 PM`
  8. `05:00 PM – 06:00 PM`
  9. `06:00 PM – 07:00 PM`
  10. `07:00 PM – 08:00 PM`
  11. `08:00 PM – 09:00 PM`
- **Booking Window:** Today through seven days ahead in Nepal local time (`Asia/Kathmandu`). Dates outside this window are inaccessible.
- **Slot Colors:**
  - **White:** Available.
  - **Red:** Booked or unavailable.
  - **Green:** Current customer's confirmed booking.
  - **Amber:** Under review / pending approval.
- **Workflow:** User selects slot -> Reviews details in modal -> Confirms -> Backend locks slot as pending -> Staff reviews & approves or rejects -> Customer receives booking verification code (e.g. `MS-8492`).

---

## 6. Pending Decisions Awaiting Business Owner Confirmation

1. **Pending Reservation Expiration Policy:** The automatic release timeout for unverified pending requests is currently held as a pending decision until the business owner confirms an exact duration (e.g. 30 minutes).
2. **Official Logo Asset:** The website is fully wired to display the official logo at `/public/logo.png`. User will provide the original logo image file.

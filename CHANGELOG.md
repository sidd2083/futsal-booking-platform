# Project Changelog & Architectural Decisions — Maya Sports Centre

## [Version 0.2.0 — Maya Sports Centre Redesign & Audit Repair] — 2026-11-09

### Rebranding & Ground Truth Alignment
- **Rebranded Venue:** Completely re-aligned all public pages and documentation to **Maya Sports Centre** (Hetauda, Bagmati Province, Nepal).
- **Positioning:** Grounded naturally as **Hetauda's No. 1 Sports Centre**.
- **Marketing Copy Audit:** Removed all unsubstantiated claims ("FIFA-grade", "38x18m stadium dimensions"). Highlighted approved facilities only: quality playing grounds, well-maintained turf, evening LED floodlighting, parking, affordable pricing, open 7 days a week.
- **Location Integration:** Added physical address (`C2FW+8VG, Rai Tole Marg, Hetauda`) with working Google Maps iframe and "Get Directions" button linking to Google Maps.
- **Contact Desk:** Wired telephone `9714577877` as a clickable direct mobile link.

### Operating Schedule & Booking Engine Repair
- **Hours & Slots:** Updated from 06:00-22:00 to **10:00 AM – 9:00 PM** (11 one-hour slots dynamically generated from start/end times).
- **Booking Window:** Enforced strict 7-day rolling window starting from today in Nepal local time (`Asia/Kathmandu`).
- **Color Coding:** Standardized slot colors: White (Available), Red (Booked), Green (Customer Confirmed), Amber (Under Review).

### Authentication Expansion
- **Two Real Registration Methods:**
  1. Continue with Google (Firebase OAuth popup + first-time phone capture).
  2. Email & Password registration (Full Name, Phone Number, Email, Password, Confirm Password) and login.
- **Unified AuthModal:** Centralized modal seamlessly integrated across navbar, booking confirmation, and booking history.

### Admin Security Repair
- **Separated Admin Gateway:** Dedicated `/admin` barrier requiring staff Firebase authentication verified against `/adminUsers` in Firestore. Removed dev role switching from client UI.

### Live Firebase Connection
- **Project Credentials:** Bound real Firebase project `futsal-2f004` via `.env.local` with `.env.example` guidance.
- **Security Rules:** Updated `firestore.rules` for `/adminUsers`, atomic slot locks, and role protection.

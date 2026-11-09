# Current Status — Maya Sports Centre

**Last Updated:** Maya Sports Centre Redesign & Functional Audit Complete  
**Active Working Branch:** `main`  
**Production Build Status:** Passing cleanly (`vite build` & `tsc -b` ✓ 1,922 modules transformed in 4.68s)  
**Firebase Project:** Connected (`futsal-2f004`)

---

## 1. Audit Summary

Following a careful audit of the previous implementation, the codebase has been repaired and upgraded:

### What Was Working & Preserved:
- Project foundation, Vite build pipeline, Tailwind CSS framework, and clean TypeScript typings.
- Clean routing architecture (`/`, `/book`, `/book/futsal`, `/customer/bookings`, `/admin`).

### What Was Broken / Incomplete & Repaired:
1. **Business Identity & Exaggerations:** Generic venue name and exaggerated claims ("FIFA-grade", "38x18m stadium dimensions") were removed. Replaced with genuine Maya Sports Centre information (Hetauda, Bagmati Province).
2. **Operating Hours:** Previously configured as 06:00 AM – 10:00 PM (16 slots). Repaired to **10:00 AM – 9:00 PM (11 one-hour slots)** generated dynamically from opening and closing times.
3. **Booking Window:** Previously allowed 14–21 days. Fixed to strictly **7 days** starting from today in Nepal local time (`Asia/Kathmandu`).
4. **Authentication:** Previously only offered Google login with mock fallback. Repaired to support **both Google OAuth and full Email/Password registration** with phone number validation and Firestore profile persistence.
5. **Admin Access Security:** Dev role switcher in the navbar was removed. A separate, authenticated **Admin Login Portal** was implemented at `/admin` requiring Firebase Authentication verified against `/adminUsers` in Firestore.
6. **Location & Directions:** Added physical address (`C2FW+8VG, Rai Tole Marg, Hetauda`) with working Google Maps iframe and "Get Directions" button linking directly to Google Maps.
7. **Contact Link:** Telephone number `9714577877` wired as a clickable direct phone link.

---

## 2. Completed Milestones

- [x] Configured real Firebase project credentials (`futsal-2f004`) in `.env.local` and `.env.example`.
- [x] Redesigned public portal (`HomePage.tsx`) with understated, Apple-caliber minimal polish and zero purple glow or artificial shapes.
- [x] Integrated `Logo` component preserving natural dimensions with `/public/logo.png` fallback.
- [x] Built `AuthModal` supporting Google Sign-In, Email/Password login, and registration.
- [x] Built dynamic 11-slot booking grid (10 AM to 9 PM) with mandatory color-coding (White, Red, Green, Amber).
- [x] Repaired Admin Dashboard with real pending queue triage, offline booking desk, order ledger, and verified revenue reports.
- [x] Hardened `firestore.rules` supporting `/adminUsers` and atomic transactions.
- [x] Clean compilation verified (`npm run build` completed with zero TypeScript errors).

---

## 3. Items Awaiting User Action or Business Decision

1. **Logo Image File:**
   - The logo component is wired to `/public/logo.png`.
   - Please supply your image file of the Maya Sports Centre logo so we can save it to `public/logo.png`.
2. **First Admin Registration in Firebase:**
   - Sign up with your admin email using the staff login portal at `/admin`.
   - In Firestore Console, create a document at `/adminUsers/{your-auth-uid}` with `{ "role": "admin", "email": "your-email" }` to grant administrative access.
3. **Pending Reservation Expiration Policy:**
   - Currently, pending slots remain blocked until staff approves or rejects them.
   - Please confirm if you wish to enforce an automated expiration duration (e.g. 30 minutes) for unconfirmed requests.
4. **GitHub Remote Push:**
   - GitHub CLI is installed. Run `gh auth login` in your terminal whenever you wish to push to remote GitHub.

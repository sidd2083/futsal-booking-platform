# Maya Sports Centre — Web Platform & Court Reservation System

The official website and court booking platform for **Maya Sports Centre**, Hetauda's No. 1 Sports Centre. Built with **React 18, Vite 5, TypeScript 5, Tailwind CSS 3, and Firebase**, optimized for deployment on **Vercel**.

---

## 📍 Venue Overview

- **Location:** `C2FW+8VG, Rai Tole Marg, Hetauda, Bagmati Province 44107, Nepal`
- **Contact Number:** `9714577877`
- **Operating Schedule:** Every day, 10:00 AM – 9:00 PM (11 hourly slots daily)
- **Rates:** Sunday – Friday: NPR 1,300 / hr | Saturday: NPR 1,500 / hr
- **Payment Method:** Pay on Arrival

---

## ⚡ Core Features

- **Public Experience:**
  - Modern, minimalist aesthetic without artificial purple glows or clutter.
  - Interactive Google Maps embed and direct "Get Directions" navigation.
  - Clickable telephone dialer for instant calls.
  - Multi-sport gateway: Football/Futsal active; Cricket practice nets marked Coming Soon.
- **Booking Engine:**
  - Strict 7-day rolling window in Nepal local time (`Asia/Kathmandu`).
  - 11 dynamically generated hourly slots (10:00 AM to 9:00 PM).
  - Four distinct slot states: White (Available), Red (Booked), Green (Customer Confirmed), Amber (Under Review).
  - Double booking prevention via atomic Firestore transactions.
  - Customer booking slip with unique verification codes (e.g. `MS-8492`).
- **Two Real Authentication Methods:**
  - Continue with Google (Firebase OAuth popup + first-time phone capture).
  - Register with Email & Password (Full name, phone, email, password validation).
- **Staff Command Center (`/admin`):**
  - Dedicated authentication barrier verifying accounts against `/adminUsers` in Firestore.
  - Real-time approval triage queue with one-tap customer dialer.
  - Offline / Walk-in reservation desk.
  - Verified revenue analytics strictly from confirmed orders.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` with your Firebase project credentials (see `.env.example`).

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Link the repository on [Vercel](https://vercel.com/).
3. Framework Preset: **Vite**.
4. Set environment variables from `.env.local` in Vercel Project Settings.
5. Deploy.

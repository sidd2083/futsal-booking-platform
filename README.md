# Futsal Booking Platform (Nepal)

A professional, high-performance web platform and court reservation system designed for a commercial futsal business in Nepal. Built with **React 18, Vite, TypeScript, Tailwind CSS, and Firebase**, optimized for seamless deployment on **Vercel**.

---

## ⚡ Key Capabilities

- **Player Experience:**
  - Responsive public portal showcasing court turf, floodlights, amenities, and location.
  - Multi-sport selection (Futsal active; Cricket marked coming soon).
  - Real-time date and hourly slot picker with live price calculation (NPR 1,300 on normal days; NPR 1,500 on Saturdays).
  - Instant booking request submission via **Pay on Arrival** with immediate slot reservation.
  - Google Sign-In with customer profile completion (Full Legal Name, Mobile Phone).
  - Customer booking ledger with unique verification codes (e.g. `FT-8492`).

- **Venue Operations (Admin):**
  - Live command center with realized revenue metrics (Today, This Week, This Month, All-Time).
  - Priority triage desk for pending booking requests (Approve or Reject with 1 tap).
  - Offline / Walk-in booking desk for counter reservations and phone callers.
  - Comprehensive order history table with search and filters.

---

## 🚀 Tech Stack

- **Frontend:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3
- **Icons:** Lucide React
- **Date Utilities:** `date-fns`
- **Backend & Database:** Cloud Firestore, Firebase Authentication, Firebase Cloud Functions
- **Hosting:** Vercel (Edge SPA)

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- Git

### 2. Clone and Install
```bash
git clone <repository-url>
cd futsal-booking-platform
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and provide your Firebase credentials:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **"New Project"**.
3. Import your GitHub repository.
4. Framework preset: **Vite**.
5. Add the environment variables from `.env.example` in Vercel Project Settings.
6. Click **Deploy**. Vercel will build and deploy the edge application globally.

---

## 📚 Project Documentation Hub

All detailed architecture, schema, and operational specifications are stored in the root documentation files:
- [`PROJECT.md`](./PROJECT.md) — Comprehensive project vision and business rules.
- [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) — Multi-phase technical roadmap.
- [`CURRENT_STATUS.md`](./CURRENT_STATUS.md) — Live engineering state and pending tasks.
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — Color palette, typography, and component styling.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System topology, security models, and tech choices.
- [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) — Firestore collections, fields, and indexes.
- [`BOOKING_LOGIC.md`](./BOOKING_LOGIC.md) — Slot calculation, pricing, and double-booking prevention.
- [`ADMIN_GUIDE.md`](./ADMIN_GUIDE.md) — Step-by-step administrative operations manual.
- [`CHANGELOG.md`](./CHANGELOG.md) — Version milestones and key technical decisions.

# System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

The Futsal Booking Platform is engineered as a modern, decoupled Single Page Application (SPA) backed by cloud-native serverless services.

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (SPA)                         │
│  React 18 + Vite 5 + TypeScript + Tailwind CSS         │
│  Hosted on VERCEL (Fast Global Edge Network)           │
├──────────────────────────┬─────────────────────────────┤
│   Public Player Portal   │    Admin Command Center     │
│   - Homepage & Discovery │    - Approval Queue         │
│   - Sport Selection      │    - All Orders Table       │
│   - Slot Booking Grid    │    - Walk-in/Manual Booking │
│   - Customer Profile     │    - Revenue Intelligence   │
└────────────┬─────────────┴───────────────┬─────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────────────────────────────────────┐
│                   FIREBASE BACKEND                     │
├────────────────────────────────────────────────────────┤
│  • Firebase Auth (Google Sign-In + Custom Claims)       │
│  • Cloud Firestore (Real-time NoSQL, Security Rules)   │
│  • Firebase Cloud Functions (Code Generator & Cron)    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Technology Selection & Rationale

| Layer | Technology | Decision Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite 5 | Instant Hot Module Replacement (HMR), lightweight build footprint, massive ecosystem support for date handling and icon sets. |
| **Type Safety** | TypeScript 5 (Strict Mode) | Eliminates runtime booking data mutations, enforces strict contract definitions between client and database models. |
| **Styling** | Tailwind CSS 3 | Zero runtime CSS overhead, standardized spacing scale, responsive utility classes without CSS bloat. |
| **Icons** | Lucide React | Clean, tree-shakeable SVG icon family matching modern Stripe/Linear aesthetics. |
| **Hosting** | Vercel | User-specified platform; global CDN, automatic SSL, preview deployments, zero-config SPA routing via rewrites. |
| **Database** | Cloud Firestore | Real-time synchronization of court availability, atomic transactions for race-condition prevention, field-level security rules. |
| **Authentication** | Firebase Auth | Seamless Google OAuth Sign-in, persistent user sessions, extensible to phone SMS authentication. |
| **Serverless Logic** | Cloud Functions for Firebase | Secure background processing for unique booking code generation and automated expiration sweeps. |

---

## 3. Frontend Application Structure

```
futsal-booking-platform/
├── public/                 # Static assets (favicons, court illustrations, metadata)
├── functions/              # Firebase Cloud Functions (TypeScript)
│   ├── src/index.ts        # Booking code generation and expiration cron
│   └── package.json
├── src/
│   ├── assets/             # Brand logos and iconography
│   ├── components/         # Reusable design system components
│   │   ├── common/         # Buttons, Badges, Modals, Inputs, Loaders
│   │   ├── layout/         # Navbar, Footer, MobileNav, AnnouncementBar
│   │   ├── booking/        # DatePicker, SlotGrid, SlotCard, BookingSummary
│   │   └── admin/          # AdminSidebar, MetricsCard, OrdersTable
│   ├── context/            # React Context providers (AuthContext, BookingContext)
│   ├── hooks/              # Custom React hooks (useAuth, useBookings, usePricing)
│   ├── lib/                # Third-party wrappers (firebase.ts, utils.ts)
│   ├── pages/              # Route views
│   │   ├── public/         # HomePage, AboutPage, ContactPage, GalleryPage
│   │   ├── booking/        # SportSelectPage, FutsalBookingPage, BookingStatusPage
│   │   ├── customer/       # CustomerProfilePage, CustomerBookingsPage
│   │   └── admin/          # AdminDashboardPage, AdminApprovalsPage, AdminManualBookingPage
│   ├── services/           # Firestore service abstractions (bookingService, pricingService)
│   ├── types/              # TypeScript interface definitions (booking.ts, user.ts, pricing.ts)
│   ├── App.tsx             # Root router with role-based route guards
│   ├── main.tsx            # React application entry point
│   └── index.css           # Tailwind CSS directives & global resets
├── firestore.rules         # Declarative database security rules
├── firestore.indexes.json  # Multi-field compound Firestore query indexes
├── firebase.json           # Firebase CLI deployment descriptor
├── vercel.json             # Vercel SPA routing rewrites configuration
├── tailwind.config.js      # Design system color and typography tokens
├── tsconfig.json           # TypeScript configuration with strict mode
└── vite.config.ts          # Vite build and path alias configuration
```

---

## 4. Security & Data Integrity Architecture

1. **Double-Booking Prevention:**
   - Every court slot is indexed by a deterministic document ID:  
     `{sport}_{courtId}_{YYYY-MM-DD}_{HH}` (e.g. `football_court1_2026-11-10_18`).
   - Slot reservations are executed using atomic Firestore Transactions. If two players attempt to select the same slot simultaneously, the transaction checks whether the slot document exists; the first transaction commits and locks the slot, while the second fails cleanly with a user-friendly notification.
2. **Server-Enforced Validation:**
   - Prices cannot be modified by the client. The Firestore security rules and backend validation compare the price against current system rules (Normal day: NPR 1,300; Saturday: NPR 1,500).
   - Customers can only read and write their own documents (`request.auth.uid == resource.data.userId`).
3. **Role-Based Admin Protection:**
   - Administrative routes and Firestore write access require administrative claims or an entry in `/admins/{uid}`.
   - Normal users are barred from changing booking statuses, marking payments received, or deleting records.

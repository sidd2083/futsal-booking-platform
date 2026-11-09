# System Architecture & Technical Specifications — Maya Sports Centre

## 1. High-Level Architecture

The platform is engineered as a decoupled Single Page Application (SPA) backed by serverless cloud primitives.

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (SPA)                         │
│  React 18 + Vite 5 + TypeScript + Tailwind CSS         │
│  Target Hosting: VERCEL (Global Edge CDN)              │
├──────────────────────────┬─────────────────────────────┤
│   Public Player Portal   │    Admin Command Center     │
│   - Homepage & Facilities│    - Protected by Auth Gate │
│   - Sport Selection      │    - Waiting Queue Triage   │
│   - 11-Slot Booking Grid │    - Offline/Counter Desk   │
│   - Customer Profile     │    - Verified Revenue Stats │
└────────────┬─────────────┴───────────────┬─────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────────────────────────────────────┐
│               FIREBASE CLOUD BACKEND                   │
│               Project ID: futsal-2f004                 │
├────────────────────────────────────────────────────────┤
│  • Firebase Authentication (Google OAuth + Password)   │
│  • Cloud Firestore (Real-time NoSQL, Security Rules)   │
│  • Firebase Cloud Functions (Code Gen & Expiration)    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Security & Anti Double-Booking Engine

1. **Deterministic Slot Identification:**
   Court slots use immutable keys:  
   `football_court1_{YYYY-MM-DD}_{HH}` (e.g. `football_court1_2026-11-10_14`).
2. **Atomic Firestore Transactions:**
   When booking, client runs `runTransaction(firestore, ...)`:
   - Reads `/slots/{slotId}`.
   - Throws error if already booked or pending.
   - Atomically writes pending lock and booking order.
3. **Role-Based Admin Protection:**
   - Routes to `/admin` render a strict authentication wall.
   - Access requires an entry in Firestore `/adminUsers/{uid}`.
   - Regular customers cannot read other users' orders or modify booking statuses.

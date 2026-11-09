# Project Changelog & Architectural Decisions

All notable changes, milestones, and architectural decisions for this project are documented in this file.

---

## [Phase 0 Foundation] — 2026-11-09

### Added
- **Project Scaffolding:** Initialized React 18, Vite 5, TypeScript 5, Tailwind CSS 3 project inside `futsal-booking-platform`.
- **Git Repository:** Local Git repository initialized with `main` branch.
- **Environment Tooling:** Installed Node.js LTS (v26.13.0) and GitHub CLI (v2.103.3).
- **Design Tokens:** Configured Tailwind theme with clean white surfaces (`#FFFFFF`), neutral slate borders, and athletic emerald brand accents (`brand-700`: `#15803D`).
- **Permanent Documentation Suite:** Authored full initial documentation:
  1. `PROJECT.md`
  2. `DEVELOPMENT_PLAN.md`
  3. `CURRENT_STATUS.md`
  4. `DESIGN_SYSTEM.md`
  5. `ARCHITECTURE.md`
  6. `DATABASE_SCHEMA.md`
  7. `BOOKING_LOGIC.md`
  8. `ADMIN_GUIDE.md`
  9. `CHANGELOG.md`
  10. `README.md`
- **Firebase Scaffolding:**
  - `firestore.rules`: Declarative security rules protecting private customer data and preventing unauthorized price/status edits.
  - `firestore.indexes.json`: Compound query indexes for customer bookings and slot dates.
  - `firebase.json`: Descriptor for Firestore and Cloud Functions emulators and deployments.
  - `functions/`: Serverless functions for unique booking code generation and automated pending reservation timeout cleanup.
- **Vercel Compatibility:** Authored `vercel.json` for SPA rewrites.

### Architectural Decisions
- **Decision 1 — Hosting Separation:** Frontend hosted on Vercel for fast global edge distribution; Firebase utilized for serverless Auth, Firestore, and Cloud Functions.
- **Decision 2 — Atomic Slot Keys:** Defined deterministic slot key format `{sport}_{courtId}_{YYYY-MM-DD}_{HH}` to guarantee single-source locking and mathematically eliminate double-booking race conditions.
- **Decision 3 — Snapshot Pricing on Orders:** Pricing is dynamically read from settings (Normal Day: NPR 1,300; Saturday: NPR 1,500) but saved as a fixed snapshot on each booking document to ensure financial historical accuracy.
- **Decision 4 — Deferred Payment Gateway:** eSewa/Khalti online payment integrations are isolated and deferred until merchant authorization is obtained; Pay on Arrival is activated as the launch payment method.

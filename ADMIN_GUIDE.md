# Administrator & Staff Operations Manual — Maya Sports Centre

## 1. Access & Security Barrier

- **Admin URL Route:** `/admin`
- **Access Control:**
  - Visiting `/admin` renders a dedicated **Staff Authentication Screen**.
  - Requires valid email/password credentials authenticated through Firebase Auth.
  - The account UID must exist in Firestore `/adminUsers/{uid}`.
  - Normal players attempting to access `/admin` receive an access denied notice.
  - No passwords or administrative credentials are hardcoded into client code.

---

## 2. Setting Up the First Administrator Account

1. Open `/admin` and click the registration modal or register your email.
2. Go to the [Firebase Console](https://console.firebase.google.com/) -> Project `futsal-2f004`.
3. In **Firestore Database**, create a document:
   - Collection: `adminUsers`
   - Document ID: `<Your Firebase Auth UID>`
   - Fields:
     - `email`: `"your-email@example.com"` (string)
     - `role`: `"admin"` (string)
     - `createdAt`: server timestamp
4. Return to `/admin` and log in. You will immediately enter the Command Center.

---

## 3. Operational Workflows

### Section A: Waiting for Approval Queue (Priority Desk)
- Central operational queue for duty staff.
- Displays all customer requests currently with status `pending`.
- Click the customer's phone number to directly dial on mobile or phone them.
- **Approve:** Generates official booking verification code (e.g. `MS-7291`), confirms slot.
- **Reject:** Prompts for reason (e.g., "Court booked offline"), updates status, and immediately frees the slot for other players.

### Section B: Offline / Counter Desk
- For walk-in customers or telephone callers.
- Select reservation date within operating schedule (10:00 AM to 9:00 PM).
- Select slot, enter customer name, and contact phone number.
- Click **"Confirm Offline Reservation"**.
- Atomically locks the slot and generates an official code.

### Section C: All Orders Ledger
- Searchable by customer name, phone number, booking code, or order ID.
- Filter by status (`Confirmed`, `Pending`, `Rejected`).
- Inspect complete audit record on click.

### Section D: Verified Revenue Reports
- Strictly counts confirmed orders (excludes pending and rejected).
- Displays Today's Revenue, This Week, This Month, All-Time, and Custom Date Range.

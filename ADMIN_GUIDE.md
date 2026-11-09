# Administrator & Staff Operations Manual

## 1. Access & Authentication

- **Admin URL Route:** `/admin`
- **Security Barrier:** Access restricted to accounts flagged in the Firestore `/admins/{uid}` collection or assigned custom admin claims in Firebase Auth.
- **Unauthorized Handling:** Casual visitors attempting to navigate to `/admin` are redirected to the homepage or a 403 Access Denied screen.

---

## 2. Dashboard Sections & Workflows

### Section A: Executive Overview
- Displays high-priority real-time cards:
  - **Today's Revenue (NPR):** Sum of confirmed bookings for the current calendar day.
  - **Weekly Revenue (NPR):** Sum of confirmed bookings for Monday – Sunday of current week.
  - **Monthly Revenue (NPR):** Sum of confirmed bookings for current month.
  - **Pending Approvals Count:** Prominent badge with direct shortcut to the approval queue.
  - **Total Registered Players:** Registered customer accounts in the database.
- **Strict Revenue Integrity:** Pending, rejected, and expired bookings are strictly excluded from all revenue totals.

---

### Section B: Waiting for Approval Queue (Priority Desk)
This is the central operational view for staff on duty.
- **Queue Display:** List of all bookings currently with `status: "pending"`.
- **Card/Row Data:**
  - Customer Full Name
  - Customer Phone Number (clickable `tel:` link for direct one-tap mobile dialing)
  - Requested Sport & Court
  - Requested Date & Time
  - Total Fee (NPR)
  - Time elapsed since submission
- **Staff Actions:**
  1. **Call Customer:** Staff phones the customer to confirm their attendance.
  2. **Approve Button:**
     - Generates booking confirmation code (e.g. `FT-4912`).
     - Updates status to `confirmed`.
     - Slot becomes permanently locked as booked.
     - Customer's screen updates in real time to show confirmed code.
  3. **Reject Button:**
     - Prompts for brief reason (e.g., "Court booked offline", "Private tournament", "Weather closure").
     - Releases the slot lock immediately.
     - Updates customer status to `rejected`.

---

### Section C: All Orders Ledger
A comprehensive audit and query table of all bookings.
- **Columns:** Booking ID, Code, Customer Name, Phone, Date, Time Slot, Price, Payment Method, Status.
- **Filters:** By Date, Status (`Pending`, `Confirmed`, `Rejected`, `Expired`), Sport (`Futsal`, `Cricket`).
- **Detail Modal:** Clicking any row opens the full order breakdown, including timestamps, payment records, and customer metadata.

---

### Section D: Offline / Walk-in Booking Desk
Empowers staff to take reservations over the counter or via incoming telephone calls.
- **Workflow:**
  1. Staff selects date.
  2. Live grid displays slot availability.
  3. Staff clicks any available (white) slot.
  4. Quick modal opens:
     - Input customer name (e.g., "Suman Shrestha").
     - Input customer phone (e.g., "9841234567").
     - Input optional staff note (e.g., "Phone reservation - advance paid in cash").
  5. Click **"Confirm Manual Booking"**.
  6. The slot is locked as `confirmed` immediately with an official booking code, preventing online players from booking over it.

---

### Section E: Pricing & Business Settings Management
Allows the owner to adjust business rules without touching code:
- Update Normal Day Rate (Current: NPR 1,300).
- Update Saturday Rate (Current: NPR 1,500).
- Modify daily opening and closing hours.

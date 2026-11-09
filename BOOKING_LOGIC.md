# Court Slot Availability & Booking Workflow Logic

## 1. Operating Schedule & Slot Division

1. **Daily Operating Hours:** 06:00 AM to 10:00 PM (16 hourly intervals).
   - Slot 1: `06:00 – 07:00`
   - Slot 2: `07:00 – 08:00`
   - ...
   - Slot 16: `21:00 – 22:00`
2. **Deterministic Identifier Scheme:**
   To guarantee that no two transactions can create disjoint documents for the same time window, every slot has an immutable deterministic document ID:
   ```
   {sport}_{courtId}_{YYYY-MM-DD}_{HH}
   ```
   Example: `football_court1_2026-11-14_07` represents Saturday morning 7:00 AM – 8:00 AM.

---

## 2. Dynamic Pricing Engine

1. **Day Determination:**
   - Evaluated based on the target reservation date, **NOT** the date the user places the order.
   - If target date is a Saturday: Rate = **NPR 1,500 / hr**.
   - If target date is Sunday – Friday: Rate = **NPR 1,300 / hr**.
2. **Configurability:**
   - Pricing rates are fetched from `/settings/pricing_and_rules`.
   - The application checks cache/local environment fallbacks if offline.
   - Pricing is saved as a static snapshot on each booking order (`ratePerHour`, `totalAmount`) so retroactive price adjustments never alter existing or historical records.

---

## 3. Slot Availability States & Color Coding

```
           [ AVAILABLE ] (White)
                 │
      User requests booking
                 │
                 ▼
           [ PENDING ] (Amber / Locked)
             /       \
      Admin           Admin
     Approve         Reject or Expire
       /               \
      ▼                 ▼
[ CONFIRMED ] (Green)   [ AVAILABLE ] (White)
(Red to public;
Green to owner)
```

| Visual State | Color Code | Customer View | Admin View | Action Permitted |
| :--- | :--- | :--- | :--- | :--- |
| **Available** | **White** (`#FFFFFF`) | "Available" + Price | "Open" | Click to book or manual reserve |
| **Pending** | **Amber** / Blocked | "Under Review" | "Pending Approval" | Admin: Approve / Reject |
| **Confirmed (Public)** | **Red** (`#DC2626`) | "Booked" | "Confirmed" | Admin: Click to view details |
| **Confirmed (Owner)** | **Green** (`#16A34A`)| "Your Booking" + Code | "Confirmed" | Customer: View booking slip |

---

## 4. Race Condition & Double-Booking Prevention

1. **Firestore Transaction Locking:**
   When a user clicks "Book Now":
   ```typescript
   await runTransaction(db, async (transaction) => {
     const slotRef = doc(db, 'slots', slotId);
     const slotDoc = await transaction.get(slotRef);
     
     if (slotDoc.exists()) {
       throw new Error('This slot was just claimed by another player. Please select another time.');
     }

     // Lock slot immediately as pending
     transaction.set(slotRef, {
       status: 'pending',
       userId: currentUserId,
       lockedAt: serverTimestamp(),
       expiresAt: new Date(Date.now() + 30 * 60 * 1000)
     });

     // Create corresponding booking order
     const bookingRef = doc(collection(db, 'bookings'));
     transaction.set(bookingRef, newBookingOrder);
   });
   ```
2. **Outcome:** Under high concurrent booking traffic, exactly one write succeeds. The runner-up transaction encounters `slotDoc.exists()` and fails gracefully with clear messaging.

---

## 5. Pay on Arrival Lifecycle

1. **Step 1 — Slot Selection:** Customer selects court, date, and available slot.
2. **Step 2 — Confirmation Prompt:** System displays modal:  
   *"Are you sure you want to book [Date] at [Time] for NPR [Amount]?"*
3. **Step 3 — Order Placement:** Customer confirms. Slot is immediately locked as `pending`.
4. **Step 4 — Waiting Room Display:**
   - Clear banner: *"Request Submitted — Waiting for Venue Approval"*
   - Explanatory card: *"Our venue staff verifies all requests and may call your phone number (+977-XXXXXXXX) to confirm availability. Please keep your phone accessible."*
5. **Step 5 — Administrative Review:**
   - **Approved:** Status flips to `confirmed`. A unique booking code (e.g. `FT-7241`) is generated. The slot turns green for the customer and red for the public.
   - **Rejected:** Status flips to `rejected`. Staff can provide a reason (e.g. "Court under maintenance"). Slot lock is deleted, immediately freeing the slot for other players.

---

## 6. Pending Slot Expiration Policy

- **The Problem:** If a customer requests a slot with Pay on Arrival and abandons it, or if staff does not respond, a slot could remain locked indefinitely.
- **Proposed Solution:** A 30-minute pending window.
- **Mechanism:** Cloud Function `expireStalePendingBookings` runs every 10 minutes, checks for pending bookings where `createdAt < 30 minutes ago`, marks them `expired`, and releases the slot lock.
- *Status:* Configured as default, pending business owner confirmation.

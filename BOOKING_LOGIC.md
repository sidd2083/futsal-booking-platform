# Court Slot Availability & Booking Workflow Logic — Maya Sports Centre

## 1. Operating Schedule & Slots

- **Daily Operating Hours:** 10:00 AM to 9:00 PM (Every day, 7 days a week).
- **Slot Count:** Exactly 11 one-hour slots daily:
  - Slot 1: `10:00 AM – 11:00 AM`
  - Slot 2: `11:00 AM – 12:00 PM`
  - Slot 3: `12:00 PM – 01:00 PM`
  - Slot 4: `01:00 PM – 02:00 PM`
  - Slot 5: `02:00 PM – 03:00 PM`
  - Slot 6: `03:00 PM – 04:00 PM`
  - Slot 7: `04:00 PM – 05:00 PM`
  - Slot 8: `05:00 PM – 06:00 PM`
  - Slot 9: `06:00 PM – 07:00 PM`
  - Slot 10: `07:00 PM – 08:00 PM`
  - Slot 11: `08:00 PM – 09:00 PM`
- **Dynamic Slot Generation:** Slots are generated from business start (`10`) and end (`21`) hours via `generateHourlySlotDefinitions()` rather than duplicated arrays.

---

## 2. 7-Day Rolling Booking Window

- Evaluated strictly using Nepal local time (`Asia/Kathmandu` / UTC+5:45).
- Customers can select **Today** through **the next 6 days** (7 calendar days total).
- Dates outside this 7-day window cannot be booked.

---

## 3. Dynamic Pricing Rules

- **Sunday through Friday:** NPR 1,300 per hour.
- **Saturday:** NPR 1,500 per hour.
- Computed dynamically based on target match date.
- Stored as an immutable snapshot on each booking order document.

---

## 4. Slot States & Color Representation

| State | Visual | Meaning | Action |
| :--- | :--- | :--- | :--- |
| **Available** | **White** | Slot is free for match booking | Click to view summary & book |
| **Booked** | **Red** | Confirmed by staff for another group | Locked |
| **Your Booking** | **Green** | Customer's own confirmed match | Shows code e.g. `MS-8421` |
| **Under Review** | **Amber** | Pending staff telephone verification | Blocked from other customers |

---

## 5. Pay on Arrival Lifecycle

1. Customer selects available slot.
2. System displays Confirmation Modal:  
   *"Are you sure you want to book [date] at [time]?"*
3. Customer confirms:
   - If not authenticated: prompted via `AuthModal` (Google or Email/Password).
   - If phone number is missing: prompted to enter mobile number.
4. Slot is locked in Firestore as `pending`.
5. Post-booking screen instructs player that staff will review and may call them to confirm.
6. Staff approves -> Status becomes `confirmed`, unique code generated (`MS-XXXX`). Slot turns green for customer and red for the public.
7. Staff rejects -> Status becomes `rejected`, slot lock is deleted, freeing the slot immediately.

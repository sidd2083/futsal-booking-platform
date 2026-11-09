# Database Schema Specification — Cloud Firestore

## 1. Collections Hierarchy

```
firestore-root/
├── users/                # Customer user profiles (Google & Email/Password)
│   └── {userId}
├── adminUsers/           # Authorized administrator UID registry
│   └── {adminId}
├── slots/                # Atomic slot locks (Single source of truth)
│   └── {slotId}
├── bookings/             # Booking orders and payment records
│   └── {bookingId}
├── settings/             # Dynamic venue pricing & hours
│   └── pricing_and_rules
└── auditLogs/            # Administrative actions audit trail
    └── {logId}
```

---

## 2. Document Models

### Collection: `users`
- **Path:** `/users/{userId}`
- **Document ID:** Firebase Auth UID

```typescript
interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;       // Verified mobile number
  authProvider: 'google' | 'password';
  photoURL?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}
```

---

### Collection: `slots`
- **Path:** `/slots/{slotId}`
- **Document ID Format:** `football_court1_{YYYY-MM-DD}_{HH}`

```typescript
interface CourtSlotDoc {
  slotId: string;
  status: 'pending' | 'confirmed';
  bookingCode?: string;      // E.g. "MS-8421"
  userId: string;
  customerName: string;
  customerPhone: string;
  date: string;              // YYYY-MM-DD
  startTime: string;         // "10:00"
  endTime: string;           // "11:00"
  sport: 'football' | 'cricket';
  lockedAt: Timestamp;
}
```

---

### Collection: `bookings`
- **Path:** `/bookings/{bookingId}`

```typescript
interface BookingOrderDoc {
  id: string;
  bookingCode?: string;      // Assigned upon confirmation e.g. "MS-8421"
  sport: 'football' | 'cricket';
  courtId: string;           // "court1"
  courtName: string;         // "Maya Sports Centre Ground"
  date: string;              // YYYY-MM-DD
  startTime: string;         // "14:00"
  endTime: string;           // "15:00"
  durationMinutes: number;   // 60
  slotId: string;
  ratePerHour: number;       // NPR 1300 or 1500
  totalAmount: number;       // NPR 1300
  currency: 'NPR';
  isSaturday: boolean;
  paymentMethod: 'pay_on_arrival';
  paymentStatus: 'pending' | 'received';
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  isManualBooking: boolean;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'expired';
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  updatedAt: string;
}
```

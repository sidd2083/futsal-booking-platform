# Database Schema Specification — Cloud Firestore

## 1. Overview & Data Modeling Strategy

Cloud Firestore is utilized as the primary operational database. The schema is normalized where transactional locking is critical (court slot reservations) and denormalized where rapid reads are required (customer order history and admin review feeds).

---

## 2. Collections Overview

```
firestore-root/
├── users/                # Customer user profiles
│   └── {userId}
├── admins/               # Authorized administrator UID registry
│   └── {adminId}
├── slots/                # Atomic slot locks (Double-booking barrier)
│   └── {slotId}
├── bookings/             # Booking records and financial orders
│   └── {bookingId}
├── settings/             # System configuration, pricing tiers & hours
│   └── pricing_and_rules
└── audit_logs/           # Administrative activity audit trail
    └── {logId}
```

---

## 3. Document Structure Specifications

### Collection: `users`
- **Path:** `/users/{userId}`
- **Document ID:** Firebase Auth UID (`string`)

```typescript
interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;       // E.g. "9841234567"
  photoURL?: string;
  role: 'customer' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### Collection: `slots` (Atomic Locking Engine)
- **Path:** `/slots/{slotId}`
- **Document ID Format:** `{sport}_{courtId}_{YYYY-MM-DD}_{HH}`  
  *Example:* `football_court1_2026-11-10_17` (Represents 5:00 PM – 6:00 PM)

```typescript
interface CourtSlot {
  slotId: string;            // Deterministic key
  sport: 'football' | 'cricket';
  courtId: string;           // E.g. "court1"
  date: string;              // "YYYY-MM-DD"
  startTime: string;         // "17:00"
  endTime: string;           // "18:00"
  status: 'available' | 'pending' | 'confirmed';
  bookingId?: string;        // Reference to the booking order
  bookingCode?: string;      // Human-readable code e.g. "FT-8492"
  userId?: string;           // Auth UID of reserving customer (or 'walk_in')
  customerName?: string;
  customerPhone?: string;
  lockedAt: Timestamp;
  expiresAt?: Timestamp;     // Timestamp when pending slot auto-releases
}
```

---

### Collection: `bookings`
- **Path:** `/bookings/{bookingId}`
- **Document ID:** Auto-generated UUID or Firestore ID

```typescript
interface BookingOrder {
  id: string;
  bookingCode?: string;      // Assigned upon confirmation e.g. "FT-8492"
  sport: 'football' | 'cricket';
  courtId: string;           // E.g. "court1"
  date: string;              // "YYYY-MM-DD"
  startTime: string;         // "17:00"
  endTime: string;           // "18:00"
  durationMinutes: number;   // Default 60
  slotId: string;            // Foreign key to `/slots/{slotId}`
  
  // Pricing Details (Snapshot at booking creation time)
  ratePerHour: number;       // NPR 1300 or 1500
  totalAmount: number;       // NPR 1300
  currency: 'NPR';
  isSaturday: boolean;
  
  // Payment
  paymentMethod: 'pay_on_arrival' | 'esewa' | 'khalti';
  paymentStatus: 'pending' | 'received' | 'refunded';
  
  // Customer Details
  userId: string;            // Auth UID or 'admin_manual'
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  isManualBooking: boolean;  // True if created by staff via offline counter
  
  // Workflow Status
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'expired';
  rejectionReason?: string;
  notes?: string;
  
  // Timestamps
  createdAt: Timestamp;
  confirmedAt?: Timestamp;
  rejectedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

---

### Collection: `settings`
- **Path:** `/settings/pricing_and_rules`

```typescript
interface SystemSettings {
  currency: 'NPR';
  pricing: {
    normalDayRate: number;   // 1300
    saturdayRate: number;    // 1500
  };
  schedule: {
    openHour: number;        // 6 (06:00)
    closeHour: number;       // 22 (22:00)
    slotDurationMinutes: number; // 60
  };
  pendingSlotTimeoutMinutes: number; // 30
  courts: Array<{
    id: string;
    name: string;
    sport: 'football' | 'cricket';
    isActive: boolean;
  }>;
}
```

---

### Collection: `audit_logs`
- **Path:** `/audit_logs/{logId}`

```typescript
interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: 'approve_booking' | 'reject_booking' | 'manual_booking' | 'update_pricing';
  targetBookingId?: string;
  details: Record<string, any>;
  timestamp: Timestamp;
}
```

export type SportType = 'football' | 'cricket';

export type SlotStatus = 'available' | 'pending' | 'confirmed' | 'disabled';

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'expired';

export type PaymentMethod = 'pay_on_arrival' | 'esewa' | 'khalti';

export type PaymentStatus = 'pending' | 'received' | 'refunded';

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourtSlot {
  slotId: string;
  sport: SportType;
  courtId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: SlotStatus;
  price: number;
  bookingId?: string;
  bookingCode?: string;
  userId?: string;
  customerName?: string;
  customerPhone?: string;
  isSaturday: boolean;
}

export interface BookingOrder {
  id: string;
  bookingCode?: string;
  sport: SportType;
  courtId: string;
  courtName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  slotId: string;
  ratePerHour: number;
  totalAmount: number;
  currency: 'NPR';
  isSaturday: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  isManualBooking: boolean;
  status: BookingStatus;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  updatedAt: string;
}

export interface PricingConfig {
  currency: 'NPR';
  normalDayRate: number; // 1300
  saturdayRate: number; // 1500
  operatingHours: {
    start: number; // 6 (06:00)
    end: number; // 22 (22:00)
    slotDurationMinutes: number;
  };
}

export interface RevenueMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  allTimeRevenue: number;
  totalBookings: number;
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  totalCustomers: number;
}

export type SportType = 'football' | 'cricket';

export type SlotStatus = 'available' | 'pending' | 'confirmed' | 'disabled';

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'expired';

export type PaymentMethod = 'pay_on_arrival' | 'pay_online' | 'esewa' | 'khalti' | 'fonepay';

export type PaymentStatus = 'pending' | 'received' | 'refunded';

export type UserRole = 'customer' | 'admin';

export type AuthProviderType = 'google' | 'password';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  authProvider: AuthProviderType;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
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
  closureReason?: string;
}

export interface CourtClosure {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason: string; // "Festival Holiday", "Turf Maintenance"
  createdAt?: string;
}

export interface SiteAnnouncement {
  id: string;
  title: string;
  message: string;
  active: boolean;
  date?: string;
  updatedAt?: string;
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
  transactionId?: string;
  paidAt?: string;
  paidAmount?: number;
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
    start: number; // 10 (10:00 AM)
    end: number; // 21 (09:00 PM)
    slotDurationMinutes: number; // 60
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

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookingOrder,
  CourtSlot,
  PricingConfig,
  RevenueMetrics,
  SportType,
} from '@/types';
import { DEFAULT_PRICING } from '@/lib/constants';
import { isSaturdayDate, generateBookingCode } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

interface BookingContextType {
  pricing: PricingConfig;
  selectedSport: SportType;
  setSelectedSport: (sport: SportType) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  slots: CourtSlot[];
  orders: BookingOrder[];
  pendingOrders: BookingOrder[];
  userOrders: BookingOrder[];
  revenueMetrics: RevenueMetrics;
  isLoading: boolean;
  requestSlotBooking: (slot: CourtSlot, customerNote?: string) => Promise<{ success: boolean; error?: string; order?: BookingOrder }>;
  adminApproveBooking: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  adminRejectBooking: (orderId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  adminCreateManualBooking: (params: {
    date: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerPhone: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string; order?: BookingOrder }>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKINGS_STORAGE_KEY = 'futsal_local_booking_orders';

// Initial seed orders for demonstration if local storage is empty
const getInitialSeedOrders = (): BookingOrder[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'ord-seed-1',
      bookingCode: 'FT-7821',
      sport: 'football',
      courtId: 'court1',
      courtName: 'Main Futsal Pitch (Pitch A)',
      date: today,
      startTime: '17:00',
      endTime: '18:00',
      durationMinutes: 60,
      slotId: `football_court1_${today}_17`,
      ratePerHour: isSaturdayDate(today) ? 1500 : 1300,
      totalAmount: isSaturdayDate(today) ? 1500 : 1300,
      currency: 'NPR',
      isSaturday: isSaturdayDate(today),
      paymentMethod: 'pay_on_arrival',
      paymentStatus: 'pending',
      userId: 'demo-customer-123',
      customerName: 'Aayush Shrestha',
      customerPhone: '9841234567',
      isManualBooking: false,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      confirmedAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ord-seed-2',
      sport: 'football',
      courtId: 'court1',
      courtName: 'Main Futsal Pitch (Pitch A)',
      date: today,
      startTime: '19:00',
      endTime: '20:00',
      durationMinutes: 60,
      slotId: `football_court1_${today}_19`,
      ratePerHour: isSaturdayDate(today) ? 1500 : 1300,
      totalAmount: isSaturdayDate(today) ? 1500 : 1300,
      currency: 'NPR',
      isSaturday: isSaturdayDate(today),
      paymentMethod: 'pay_on_arrival',
      paymentStatus: 'pending',
      userId: 'customer-prakash-456',
      customerName: 'Prakash Thapa',
      customerPhone: '9801234567',
      isManualBooking: false,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<SportType>('football');
  
  // Format today as YYYY-MM-DD in local time
  const todayFormatted = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayFormatted);
  const [pricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [orders, setOrders] = useState<BookingOrder[]>(() => {
    const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialSeedOrders();
      }
    }
    return getInitialSeedOrders();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to local storage whenever orders update
  useEffect(() => {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // Firestore synchronization if configured
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      setIsLoading(true);
      const q = query(collection(db, 'bookings'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched: BookingOrder[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as BookingOrder);
        });
        setOrders(fetched);
        setIsLoading(false);
      }, (err) => {
        console.error('Firestore bookings listener error:', err);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  // Generate slots for the selected date
  const slots = useMemo((): CourtSlot[] => {
    const isSat = isSaturdayDate(selectedDate);
    const price = isSat ? pricing.saturdayRate : pricing.normalDayRate;
    const generated: CourtSlot[] = [];

    const activeOrdersOnDate = orders.filter(
      (o) => o.date === selectedDate && o.sport === selectedSport && o.status !== 'rejected' && o.status !== 'expired' && o.status !== 'cancelled'
    );

    for (let hour = pricing.operatingHours.start; hour < pricing.operatingHours.end; hour++) {
      const startStr = `${hour.toString().padStart(2, '0')}:00`;
      const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
      const slotKey = `${selectedSport}_court1_${selectedDate}_${hour.toString().padStart(2, '0')}`;

      // Check if slot has a confirmed or pending booking
      const match = activeOrdersOnDate.find((o) => o.startTime === startStr);

      if (match) {
        generated.push({
          slotId: slotKey,
          sport: selectedSport,
          courtId: 'court1',
          date: selectedDate,
          startTime: startStr,
          endTime: endStr,
          status: match.status === 'confirmed' ? 'confirmed' : 'pending',
          price: match.totalAmount,
          bookingId: match.id,
          bookingCode: match.bookingCode,
          userId: match.userId,
          customerName: match.customerName,
          customerPhone: match.customerPhone,
          isSaturday: isSat,
        });
      } else {
        generated.push({
          slotId: slotKey,
          sport: selectedSport,
          courtId: 'court1',
          date: selectedDate,
          startTime: startStr,
          endTime: endStr,
          status: 'available',
          price,
          isSaturday: isSat,
        });
      }
    }

    return generated;
  }, [selectedDate, selectedSport, orders, pricing]);

  // Request a slot booking (Customer Pay on Arrival workflow)
  const requestSlotBooking = useCallback(
    async (
      slot: CourtSlot,
      customerNote?: string
    ): Promise<{ success: boolean; error?: string; order?: BookingOrder }> => {
      if (!user) {
        return { success: false, error: 'Please sign in to complete your booking.' };
      }
      if (!user.phoneNumber || user.phoneNumber.trim().length < 8) {
        return {
          success: false,
          error: 'Please complete your phone number in your profile so we can confirm your reservation.',
        };
      }

      // Check for slot collision
      const existing = orders.find(
        (o) =>
          o.date === slot.date &&
          o.startTime === slot.startTime &&
          o.sport === slot.sport &&
          o.status !== 'rejected' &&
          o.status !== 'expired' &&
          o.status !== 'cancelled'
      );

      if (existing) {
        return {
          success: false,
          error: 'This slot is already reserved. Please select another available time.',
        };
      }

      const isSat = isSaturdayDate(slot.date);
      const totalAmount = isSat ? pricing.saturdayRate : pricing.normalDayRate;

      const newOrder: BookingOrder = {
        id: `ord-${Date.now()}`,
        sport: slot.sport,
        courtId: slot.courtId || 'court1',
        courtName: 'Main Futsal Pitch (Pitch A)',
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        durationMinutes: 60,
        slotId: slot.slotId,
        ratePerHour: totalAmount,
        totalAmount,
        currency: 'NPR',
        isSaturday: isSat,
        paymentMethod: 'pay_on_arrival',
        paymentStatus: 'pending',
        userId: user.uid,
        customerName: user.fullName || 'Customer',
        customerPhone: user.phoneNumber,
        customerEmail: user.email,
        isManualBooking: false,
        status: 'pending',
        notes: customerNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const firestore = db;
      if (isFirebaseConfigured && firestore) {
        try {
          await runTransaction(firestore, async (tx) => {
            const slotRef = doc(firestore, 'slots', slot.slotId);
            const slotSnap = await tx.get(slotRef);
            if (slotSnap.exists()) {
              throw new Error('This slot has just been claimed by another player.');
            }
            tx.set(slotRef, {
              status: 'pending',
              userId: user.uid,
              customerName: user.fullName,
              customerPhone: user.phoneNumber,
              date: slot.date,
              sport: slot.sport,
              lockedAt: serverTimestamp(),
            });
            const orderRef = doc(collection(firestore, 'bookings'));
            tx.set(orderRef, newOrder);
          });
        } catch (err: any) {
          return { success: false, error: err.message || 'Booking transaction failed.' };
        }
      } else {
        setOrders((prev) => [newOrder, ...prev]);
      }

      return { success: true, order: newOrder };
    },
    [user, orders, pricing]
  );

  // Admin approves a pending booking
  const adminApproveBooking = useCallback(
    async (orderId: string): Promise<{ success: boolean; error?: string }> => {
      const code = generateBookingCode(selectedSport);
      const firestore = db;
      if (isFirebaseConfigured && firestore) {
        try {
          const orderRef = doc(firestore, 'bookings', orderId);
          await runTransaction(firestore, async (tx) => {
            const snap = await tx.get(orderRef);
            if (!snap.exists()) throw new Error('Order not found.');
            const data = snap.data() as BookingOrder;
            tx.update(orderRef, {
              status: 'confirmed',
              bookingCode: code,
              confirmedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            if (data.slotId) {
              const slotRef = doc(firestore, 'slots', data.slotId);
              tx.set(slotRef, { status: 'confirmed', bookingCode: code }, { merge: true });
            }
          });
        } catch (err: any) {
          return { success: false, error: err.message };
        }
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'confirmed',
                  bookingCode: code,
                  confirmedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : o
          )
        );
      }
      return { success: true };
    },
    [selectedSport]
  );

  // Admin rejects a pending booking
  const adminRejectBooking = useCallback(
    async (orderId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
      const firestore = db;
      if (isFirebaseConfigured && firestore) {
        try {
          const orderRef = doc(firestore, 'bookings', orderId);
          await runTransaction(firestore, async (tx) => {
            const snap = await tx.get(orderRef);
            if (!snap.exists()) throw new Error('Order not found.');
            const data = snap.data() as BookingOrder;
            tx.update(orderRef, {
              status: 'rejected',
              rejectionReason: reason || 'Declined by venue manager',
              rejectedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            if (data.slotId) {
              const slotRef = doc(firestore, 'slots', data.slotId);
              tx.delete(slotRef);
            }
          });
        } catch (err: any) {
          return { success: false, error: err.message };
        }
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'rejected',
                  rejectionReason: reason || 'Declined by venue manager',
                  rejectedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : o
          )
        );
      }
      return { success: true };
    },
    []
  );

  // Admin creates an offline/manual walk-in booking
  const adminCreateManualBooking = useCallback(
    async (params: {
      date: string;
      startTime: string;
      endTime: string;
      customerName: string;
      customerPhone: string;
      notes?: string;
    }): Promise<{ success: boolean; error?: string; order?: BookingOrder }> => {
      const isSat = isSaturdayDate(params.date);
      const totalAmount = isSat ? pricing.saturdayRate : pricing.normalDayRate;
      const code = generateBookingCode('football');
      const slotHour = params.startTime.split(':')[0];
      const slotId = `football_court1_${params.date}_${slotHour}`;

      const manualOrder: BookingOrder = {
        id: `manual-ord-${Date.now()}`,
        bookingCode: code,
        sport: 'football',
        courtId: 'court1',
        courtName: 'Main Futsal Pitch (Pitch A)',
        date: params.date,
        startTime: params.startTime,
        endTime: params.endTime,
        durationMinutes: 60,
        slotId,
        ratePerHour: totalAmount,
        totalAmount,
        currency: 'NPR',
        isSaturday: isSat,
        paymentMethod: 'pay_on_arrival',
        paymentStatus: 'received', // Counter bookings usually collected in cash/Fonepay
        userId: 'admin_counter',
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        isManualBooking: true,
        status: 'confirmed',
        notes: params.notes,
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const firestore = db;
      if (isFirebaseConfigured && firestore) {
        try {
          const orderRef = doc(collection(firestore, 'bookings'));
          const slotRef = doc(firestore, 'slots', slotId);
          await runTransaction(firestore, async (tx) => {
            const slotSnap = await tx.get(slotRef);
            if (slotSnap.exists()) throw new Error('Slot is already occupied.');
            tx.set(slotRef, {
              status: 'confirmed',
              bookingCode: code,
              customerName: params.customerName,
              customerPhone: params.customerPhone,
              date: params.date,
              sport: 'football',
              lockedAt: serverTimestamp(),
            });
            tx.set(orderRef, manualOrder);
          });
        } catch (err: any) {
          return { success: false, error: err.message };
        }
      } else {
        setOrders((prev) => [manualOrder, ...prev]);
      }

      return { success: true, order: manualOrder };
    },
    [pricing]
  );

  // Revenue metrics: strictly calculates confirmed bookings
  const revenueMetrics = useMemo((): RevenueMetrics => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Calculate start of current week (Monday)
    const currentDay = now.getDay(); // 0 is Sunday
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const weekStartStr = monday.toISOString().split('T')[0];

    // Current month prefix: YYYY-MM
    const currentMonthPrefix = today.substring(0, 7);

    let todayRev = 0;
    let weekRev = 0;
    let monthRev = 0;
    let allTimeRev = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let rejectedCount = 0;

    const uniqueCustomers = new Set<string>();

    orders.forEach((o) => {
      if (o.userId && o.userId !== 'admin_counter') {
        uniqueCustomers.add(o.userId);
      } else if (o.customerPhone) {
        uniqueCustomers.add(o.customerPhone);
      }

      if (o.status === 'pending') pendingCount++;
      if (o.status === 'rejected') rejectedCount++;

      // Financials: STRICTLY CONFIRMED
      if (o.status === 'confirmed') {
        confirmedCount++;
        allTimeRev += o.totalAmount;

        if (o.date === today) {
          todayRev += o.totalAmount;
        }
        if (o.date >= weekStartStr && o.date <= today) {
          weekRev += o.totalAmount;
        }
        if (o.date.startsWith(currentMonthPrefix)) {
          monthRev += o.totalAmount;
        }
      }
    });

    return {
      todayRevenue: todayRev,
      weekRevenue: weekRev,
      monthRevenue: monthRev,
      allTimeRevenue: allTimeRev,
      totalBookings: orders.length,
      pendingCount,
      confirmedCount,
      rejectedCount,
      totalCustomers: Math.max(uniqueCustomers.size, 1),
    };
  }, [orders]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'pending'),
    [orders]
  );

  const userOrders = useMemo(
    () => (user ? orders.filter((o) => o.userId === user.uid) : []),
    [orders, user]
  );

  return (
    <BookingContext.Provider
      value={{
        pricing,
        selectedSport,
        setSelectedSport,
        selectedDate,
        setSelectedDate,
        slots,
        orders,
        pendingOrders,
        userOrders,
        revenueMetrics,
        isLoading,
        requestSlotBooking,
        adminApproveBooking,
        adminRejectBooking,
        adminCreateManualBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

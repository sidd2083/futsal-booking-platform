import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookingOrder,
  CourtSlot,
  PricingConfig,
  RevenueMetrics,
  SportType,
  PaymentMethod,
  CourtClosure,
  SiteAnnouncement,
} from '@/types';
import { DEFAULT_PRICING, BUSINESS_INFO } from '@/lib/constants';
import {
  isSaturdayDate,
  generateBookingCode,
  generateHourlySlotDefinitions,
  getNepalTodayFormatted,
  isSlotPassedInNepal,
  sanitizeFirestoreData,
} from '@/lib/utils';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

interface BookingContextType {
  pricing: PricingConfig;
  updatePricing: (newPricing: { normalDayRate: number; saturdayRate: number }) => Promise<{ success: boolean; error?: string }>;
  closures: CourtClosure[];
  addClosure: (closure: { date: string; startTime: string; endTime: string; reason: string }) => Promise<{ success: boolean; error?: string }>;
  removeClosure: (closureId: string) => Promise<{ success: boolean; error?: string }>;
  announcement: SiteAnnouncement | null;
  updateAnnouncement: (announcement: { title: string; message: string; active: boolean }) => Promise<{ success: boolean; error?: string }>;
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
  requestSlotBooking: (
    slot: CourtSlot,
    customerNote?: string,
    paymentMethod?: PaymentMethod
  ) => Promise<{ success: boolean; error?: string; order?: BookingOrder }>;
  adminApproveBooking: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  adminRejectBooking: (orderId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  adminCancelBooking: (orderIdOrSlotId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
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

const BOOKINGS_STORAGE_KEY = 'maya_local_booking_orders';
const PRICING_STORAGE_KEY = 'maya_local_pricing';
const CLOSURES_STORAGE_KEY = 'maya_local_closures';
const ANNOUNCEMENT_STORAGE_KEY = 'maya_local_announcement';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<SportType>('football');

  // Nepal local date today
  const nepalToday = useMemo(() => getNepalTodayFormatted(), []);
  const [selectedDate, setSelectedDate] = useState<string>(nepalToday);

  // Dynamic Pricing State (synced with Firestore settings/pricing)
  const [pricing, setPricing] = useState<PricingConfig>(() => {
    try {
      const saved = localStorage.getItem(PRICING_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PRICING;
    } catch {
      return DEFAULT_PRICING;
    }
  });

  // Court Closures / Holiday Breaks (synced with Firestore courtClosures)
  const [closures, setClosures] = useState<CourtClosure[]>(() => {
    try {
      const saved = localStorage.getItem(CLOSURES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Announcement (synced with Firestore settings/announcement)
  const [announcement, setAnnouncement] = useState<SiteAnnouncement | null>(() => {
    try {
      const saved = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState<BookingOrder[]>(() => {
    const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync orders to local storage
  useEffect(() => {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // Sync pricing, closures, and announcement listeners from Firestore
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      // 1. Pricing listener
      const unsubPricing = onSnapshot(doc(db, 'settings', 'pricing'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setPricing((prev) => {
            const next: PricingConfig = {
              ...prev,
              normalDayRate: Number(data.normalDayRate) || prev.normalDayRate,
              saturdayRate: Number(data.saturdayRate) || prev.saturdayRate,
            };
            try {
              localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {
              console.warn('Storage notice:', e);
            }
            return next;
          });
        }
      });

      // 2. Court Closures listener
      const unsubClosures = onSnapshot(collection(db, 'courtClosures'), (snap) => {
        const fetchedClosures: CourtClosure[] = [];
        snap.forEach((docSnap) => {
          fetchedClosures.push({ id: docSnap.id, ...docSnap.data() } as CourtClosure);
        });
        setClosures(fetchedClosures);
        try {
          localStorage.setItem(CLOSURES_STORAGE_KEY, JSON.stringify(fetchedClosures));
        } catch (e) {
          console.warn('Storage notice:', e);
        }
      });

      // 3. Announcement listener
      const unsubAnnouncement = onSnapshot(doc(db, 'settings', 'announcement'), (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as SiteAnnouncement;
          setAnnouncement(data);
          try {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(data));
          } catch (e) {
            console.warn('Storage notice:', e);
          }
        }
      });

      return () => {
        unsubPricing();
        unsubClosures();
        unsubAnnouncement();
      };
    }
  }, []);

  // Firestore live listener on bookings collection
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      setIsLoading(true);
      const q = query(collection(db, 'bookings'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: BookingOrder[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              ...data,
            } as BookingOrder);
          });
          setOrders((prev) => {
            const map = new Map<string, BookingOrder>();
            // Keep local orders
            prev.forEach((o) => map.set(o.id, o));
            // Apply fresh remote updates with smart conflict resolution
            fetched.forEach((remote) => {
              const local = map.get(remote.id);
              // If locally confirmed, never revert to pending due to replication lag
              if (local && local.status === 'confirmed' && remote.status === 'pending') {
                map.set(remote.id, {
                  ...remote,
                  status: 'confirmed',
                  bookingCode: local.bookingCode || remote.bookingCode,
                });
              } else {
                map.set(remote.id, remote);
              }
            });
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
          setIsLoading(false);
        },
        (err) => {
          console.error('Firestore bookings listener error:', err);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, []);

  // Generate the 11 hourly slots dynamically (10:00 AM to 09:00 PM)
  const slotDefinitions = useMemo(() => {
    return generateHourlySlotDefinitions(
      pricing.operatingHours.start,
      pricing.operatingHours.end
    );
  }, [pricing.operatingHours.start, pricing.operatingHours.end]);

  // Compute live slot availability for selected date
  const slots = useMemo((): CourtSlot[] => {
    const isSat = isSaturdayDate(selectedDate);
    const price = isSat ? pricing.saturdayRate : pricing.normalDayRate;
    const generated: CourtSlot[] = [];

    // Filter active bookings on the selected date & sport
    const activeOrdersOnDate = orders.filter(
      (o) =>
        o.date === selectedDate &&
        o.sport === selectedSport &&
        o.status !== 'rejected' &&
        o.status !== 'expired' &&
        o.status !== 'cancelled'
    );

    for (const def of slotDefinitions) {
      const hourPart = def.startTime.split(':')[0];
      const slotKey = `${selectedSport}_court1_${selectedDate}_${hourPart}`;

      // Check if slot falls in a court closure / holiday / maintenance break
      const closureMatch = closures.find(
        (c) =>
          c.date === selectedDate &&
          def.startTime >= c.startTime &&
          def.startTime < c.endTime
      );

      if (closureMatch) {
        generated.push({
          slotId: slotKey,
          sport: selectedSport,
          courtId: 'court1',
          date: selectedDate,
          startTime: def.startTime,
          endTime: def.endTime,
          status: 'disabled',
          price,
          isSaturday: isSat,
          closureReason: closureMatch.reason || 'Court Closed / Holiday Break',
        });
        continue;
      }

      const match = activeOrdersOnDate.find((o) => o.startTime === def.startTime);

      if (match) {
        generated.push({
          slotId: slotKey,
          sport: selectedSport,
          courtId: 'court1',
          date: selectedDate,
          startTime: def.startTime,
          endTime: def.endTime,
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
        const isPassed = isSlotPassedInNepal(selectedDate, def.startTime);
        generated.push({
          slotId: slotKey,
          sport: selectedSport,
          courtId: 'court1',
          date: selectedDate,
          startTime: def.startTime,
          endTime: def.endTime,
          status: isPassed ? 'disabled' : 'available',
          price,
          isSaturday: isSat,
        });
      }
    }

    return generated;
  }, [selectedDate, selectedSport, orders, pricing, slotDefinitions, closures]);

  // Request a slot booking (Pay on Arrival or Pay Online workflow with Firestore Transaction)
  const requestSlotBooking = useCallback(
    async (
      slot: CourtSlot,
      customerNote?: string,
      paymentMethod: PaymentMethod = 'pay_on_arrival'
    ): Promise<{ success: boolean; error?: string; order?: BookingOrder }> => {
      if (!user) {
        return { success: false, error: 'Please sign in to complete your booking.' };
      }

      // Security & Anti-fake check: Validate phone strictly (valid Nepal mobile number)
      const cleanPhone = (user.phoneNumber || '').trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10 || !/^(98|97|96)/.test(cleanPhone)) {
        return {
          success: false,
          error: 'Please provide a valid 10-digit mobile number (e.g., 98XXXXXXXX) so our venue staff can verify your match attendance.',
        };
      }

      // Anti-spam rate limit: Max 3 active pending orders per user
      const userActivePending = orders.filter(
        (o) => o.userId === user.uid && o.status === 'pending'
      );
      if (userActivePending.length >= 3) {
        return {
          success: false,
          error: 'You already have 3 pending reservations awaiting staff call. Please wait for confirmation before reserving more.',
        };
      }

      // Check if slot has already passed in Nepal local time (UTC+5:45)
      if (isSlotPassedInNepal(slot.date, slot.startTime)) {
        return {
          success: false,
          error: 'This playing hour has already passed in Nepal time. Please pick an upcoming slot.',
        };
      }

      // Check if slot falls in a court closure / holiday break
      const closureMatch = closures.find(
        (c) =>
          c.date === slot.date &&
          slot.startTime >= c.startTime &&
          slot.startTime < c.endTime
      );
      if (closureMatch) {
        return {
          success: false,
          error: `Court is closed for this hour: ${closureMatch.reason || 'Holiday / Maintenance Break'}.`,
        };
      }

      // Check for slot collision locally
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

      // Sanitize notes (max 150 chars, no raw HTML/scripts)
      const sanitizedNotes = customerNote
        ? customerNote.trim().slice(0, 150).replace(/[<>]/g, '')
        : '';

      const newOrder: BookingOrder = {
        id: `ord-${Date.now()}`,
        sport: slot.sport,
        courtId: slot.courtId || 'court1',
        courtName: `${BUSINESS_INFO.name} Ground`,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        durationMinutes: 60,
        slotId: slot.slotId,
        ratePerHour: totalAmount,
        totalAmount,
        currency: 'NPR',
        isSaturday: isSat,
        paymentMethod: paymentMethod || 'pay_on_arrival',
        paymentStatus: 'pending',
        userId: user.uid,
        customerName: (user.fullName || 'Customer').trim(),
        customerPhone: cleanPhone,
        customerEmail: user.email || '',
        isManualBooking: false,
        status: 'pending',
        notes: sanitizedNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // ─── OPTIMISTIC INSTANT LOCK (0ms Latency) ───
      // Immediately lock slot in local state so the red/booked state appears in 0ms!
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);

      const firestore = db;
      if (isFirebaseConfigured && firestore) {
        try {
          await runTransaction(firestore, async (tx) => {
            const slotRef = doc(firestore, 'slots', slot.slotId);
            const slotSnap = await tx.get(slotRef);

            // Double booking prevention check on Firestore
            if (slotSnap.exists()) {
              const currentSlotData = slotSnap.data();
              if (currentSlotData.status === 'confirmed' || currentSlotData.status === 'pending') {
                throw new Error('This slot was just claimed by another player. Please pick another time.');
              }
            }

            // Lock slot atomically in Firestore (clean data - NO undefined values)
            tx.set(slotRef, sanitizeFirestoreData({
              slotId: slot.slotId,
              status: 'pending',
              userId: user.uid,
              customerName: user.fullName || 'Customer',
              customerPhone: cleanPhone,
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              sport: slot.sport,
              lockedAt: serverTimestamp(),
            }));

            // Record booking document (clean data - NO undefined values)
            const orderRef = doc(collection(firestore, 'bookings'));
            newOrder.id = orderRef.id;
            tx.set(orderRef, sanitizeFirestoreData({
              ...newOrder,
              createdAtServer: serverTimestamp(),
              updatedAtServer: serverTimestamp(),
            }));
          });

          // Finalize local order with server-generated ID
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id && o.slotId !== newOrder.slotId)]);
        } catch (err: any) {
          // Rollback optimistic lock on failure
          setOrders((prev) => prev.filter((o) => o.id !== newOrder.id));
          return {
            success: false,
            error: err.message || 'Slot reservation failed. Please refresh availability.',
          };
        }
      }

      return { success: true, order: newOrder };
    },
    [user, orders, pricing, closures]
  );

  // Admin approves a pending booking
  const adminApproveBooking = useCallback(
    async (orderId: string): Promise<{ success: boolean; error?: string }> => {
      const target = orders.find((o) => o.id === orderId);
      const code = target?.bookingCode || generateBookingCode(selectedSport);
      const firestore = db;

      if (isFirebaseConfigured && firestore) {
        try {
          const orderRef = doc(firestore, 'bookings', orderId);
          await setDoc(
            orderRef,
            sanitizeFirestoreData({
              status: 'confirmed',
              bookingCode: code,
              confirmedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              updatedAtServer: serverTimestamp(),
            }),
            { merge: true }
          );

          if (target?.slotId) {
            const slotRef = doc(firestore, 'slots', target.slotId);
            await setDoc(
              slotRef,
              sanitizeFirestoreData({
                status: 'confirmed',
                bookingCode: code,
                confirmedAt: serverTimestamp(),
              }),
              { merge: true }
            );
          }
        } catch (err: any) {
          console.warn('Firestore approval notice:', err);
        }
      }

      // Always update local state immediately
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
      return { success: true };
    },
    [selectedSport, orders]
  );

  // Admin rejects a pending booking (immediately releasing the slot)
  const adminRejectBooking = useCallback(
    async (orderId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
      const target = orders.find((o) => o.id === orderId);
      const firestore = db;

      if (isFirebaseConfigured && firestore) {
        try {
          const orderRef = doc(firestore, 'bookings', orderId);
          await setDoc(
            orderRef,
            sanitizeFirestoreData({
              status: 'rejected',
              rejectionReason: reason || 'Declined by venue manager',
              rejectedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              updatedAtServer: serverTimestamp(),
            }),
            { merge: true }
          );

          // Free the slot so it becomes available again
          if (target?.slotId) {
            const slotRef = doc(firestore, 'slots', target.slotId);
            await deleteDoc(slotRef).catch(() => {
              // Slot may already be gone – that's fine
            });
          }
        } catch (err: any) {
          console.warn('Firestore reject notice:', err);
          // Fall through to update local state anyway
        }
      }

      // Always update local state immediately
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
      return { success: true };
    },
    [orders]
  );

  // Admin cancels a booking or slot (immediately freeing the court slot for new bookings)
  const adminCancelBooking = useCallback(
    async (orderIdOrSlotId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
      const target = orders.find(
        (o) => o.id === orderIdOrSlotId || o.slotId === orderIdOrSlotId || o.bookingCode === orderIdOrSlotId
      );
      const effectiveOrderId = target ? target.id : orderIdOrSlotId;
      const effectiveSlotId = target?.slotId || (orderIdOrSlotId.includes('_') ? orderIdOrSlotId : null);

      const firestore = db;
      if (isFirebaseConfigured && firestore) {
        try {
          if (effectiveSlotId) {
            const slotRef = doc(firestore, 'slots', effectiveSlotId);
            await deleteDoc(slotRef).catch(() => {});
          }

          if (target) {
            const orderRef = doc(firestore, 'bookings', effectiveOrderId);
            await setDoc(
              orderRef,
              sanitizeFirestoreData({
                status: 'cancelled',
                cancellationReason: reason || 'Cancelled by staff / player request',
                cancelledAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                updatedAtServer: serverTimestamp(),
              }),
              { merge: true }
            );
          }
        } catch (err: any) {
          console.warn('Firestore cancel slot notice:', err);
        }
      }

      // Immediately free the slot in local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === effectiveOrderId || (effectiveSlotId && o.slotId === effectiveSlotId)
            ? {
                ...o,
                status: 'cancelled',
                cancellationReason: reason || 'Cancelled by staff / player request',
                cancelledAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : o
        )
      );

      return { success: true };
    },
    [orders]
  );

  // Admin creates an offline/walk-in booking
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
      const hourPart = params.startTime.split(':')[0];
      const slotId = `football_court1_${params.date}_${hourPart}`;

      const manualOrder: BookingOrder = {
        id: `manual-ord-${Date.now()}`,
        bookingCode: code,
        sport: 'football',
        courtId: 'court1',
        courtName: `${BUSINESS_INFO.name} Ground`,
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
        paymentStatus: 'received',
        userId: 'admin_counter_desk',
        customerName: params.customerName.trim(),
        customerPhone: params.customerPhone.trim(),
        isManualBooking: true,
        status: 'confirmed',
        notes: params.notes || '',
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const firestore = db;
      if (isFirebaseConfigured && firestore) {
        try {
          const orderRef = doc(collection(firestore, 'bookings'));
          manualOrder.id = orderRef.id;
          const slotRef = doc(firestore, 'slots', slotId);

          // Write slot lock and booking record in parallel (clean data - NO undefined values)
          await Promise.all([
            setDoc(slotRef, sanitizeFirestoreData({
              slotId,
              status: 'confirmed',
              bookingCode: code,
              customerName: params.customerName.trim(),
              customerPhone: params.customerPhone.trim(),
              date: params.date,
              startTime: params.startTime,
              endTime: params.endTime,
              sport: 'football',
              lockedAt: serverTimestamp(),
            })),
            setDoc(orderRef, sanitizeFirestoreData({
              ...manualOrder,
              createdAtServer: serverTimestamp(),
              updatedAtServer: serverTimestamp(),
            })),
          ]);
        } catch (err: any) {
          console.warn('Firestore offline sync notice (saved locally):', err);
          // Do not block offline creation! Save locally below.
        }
      }

      // Always update local state & cache immediately so slot is locked & code is ready
      setOrders((prev) => [manualOrder, ...prev.filter((o) => o.id !== manualOrder.id)]);
      return { success: true, order: manualOrder };
    },
    [pricing]
  );

  // Dynamic Pricing Update Handler (Admin)
  const updatePricing = useCallback(
    async (newRates: { normalDayRate: number; saturdayRate: number }) => {
      const updated: PricingConfig = {
        ...pricing,
        normalDayRate: Number(newRates.normalDayRate) || pricing.normalDayRate,
        saturdayRate: Number(newRates.saturdayRate) || pricing.saturdayRate,
      };
      setPricing(updated);
      try {
        localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage notice:', e);
      }

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'settings', 'pricing'), sanitizeFirestoreData(updated), { merge: true });
        } catch (err: any) {
          console.warn('Firestore pricing sync notice:', err);
        }
      }
      return { success: true };
    },
    [pricing]
  );

  // Court Closure / Holiday Break Add Handler (Admin)
  const addClosure = useCallback(
    async (closureData: { date: string; startTime: string; endTime: string; reason: string }) => {
      const newClosure: CourtClosure = {
        id: `closure-${Date.now()}`,
        ...closureData,
        createdAt: new Date().toISOString(),
      };
      setClosures((prev) => [newClosure, ...prev]);

      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(collection(db, 'courtClosures'));
          newClosure.id = docRef.id;
          await setDoc(docRef, sanitizeFirestoreData(newClosure));
        } catch (err: any) {
          console.warn('Firestore closure sync notice:', err);
        }
      }
      return { success: true };
    },
    []
  );

  // Court Closure Remove Handler (Admin)
  const removeClosure = useCallback(
    async (closureId: string) => {
      setClosures((prev) => prev.filter((c) => c.id !== closureId));

      if (isFirebaseConfigured && db) {
        try {
          await deleteDoc(doc(db, 'courtClosures', closureId));
        } catch (err: any) {
          console.warn('Firestore delete closure notice:', err);
        }
      }
      return { success: true };
    },
    []
  );

  // Global Announcement Update Handler (Admin)
  const updateAnnouncement = useCallback(
    async (data: { title: string; message: string; active: boolean }) => {
      const updated: SiteAnnouncement = {
        id: `announcement-${Date.now()}`,
        title: data.title,
        message: data.message,
        active: data.active,
        date: getNepalTodayFormatted(),
        updatedAt: new Date().toISOString(),
      };
      setAnnouncement(updated);
      try {
        localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage notice:', e);
      }

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'settings', 'announcement'), sanitizeFirestoreData(updated), { merge: true });
        } catch (err: any) {
          console.warn('Firestore announcement sync notice:', err);
        }
      }
      return { success: true };
    },
    []
  );

  // Revenue metrics strictly computed from confirmed orders
  const revenueMetrics = useMemo((): RevenueMetrics => {
    const todayStr = getNepalTodayFormatted();
    const now = new Date();

    const currentDay = now.getDay();
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const weekStartStr = monday.toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.substring(0, 7);

    let todayRev = 0;
    let weekRev = 0;
    let monthRev = 0;
    let allTimeRev = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let rejectedCount = 0;

    const uniqueCustomers = new Set<string>();

    orders.forEach((o) => {
      if (o.userId && o.userId !== 'admin_counter' && o.userId !== 'admin_counter_desk') {
        uniqueCustomers.add(o.userId);
      } else if (o.customerPhone) {
        uniqueCustomers.add(o.customerPhone);
      }

      if (o.status === 'pending') pendingCount++;
      if (o.status === 'rejected') rejectedCount++;

      // Strict revenue rule: ONLY CONFIRMED
      if (o.status === 'confirmed') {
        const amt = typeof o.totalAmount === 'number' && !isNaN(o.totalAmount) ? o.totalAmount : 0;
        confirmedCount++;
        allTimeRev += amt;

        if (o.date === todayStr) {
          todayRev += amt;
        }
        if (o.date >= weekStartStr && o.date <= todayStr) {
          weekRev += amt;
        }
        if (o.date && o.date.startsWith(currentMonthPrefix)) {
          monthRev += amt;
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

  // Auto-prune order history: customer sees ONLY their own actual bookings; manual counter bookings are excluded!
  const userOrders = useMemo(() => {
    if (!user) return [];
    return orders
      .filter((o) => o.userId === user.uid && !o.isManualBooking && o.userId !== 'admin_counter' && o.userId !== 'admin_counter_desk')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 7);
  }, [orders, user]);

  // Persistent auto-cleanup: delete user orders older than the latest 7 from storage and state
  useEffect(() => {
    if (!user) return;
    const userAll = orders
      .filter((o) => o.userId === user.uid && !o.isManualBooking && o.userId !== 'admin_counter' && o.userId !== 'admin_counter_desk')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    if (userAll.length > 7) {
      const keepIds = new Set(userAll.slice(0, 7).map((o) => o.id));
      setOrders((prev) =>
        prev.filter((o) => (o.userId !== user.uid || o.isManualBooking) || keepIds.has(o.id))
      );
    }
  }, [user, orders]);

  return (
    <BookingContext.Provider
      value={{
        pricing,
        updatePricing,
        closures,
        addClosure,
        removeClosure,
        announcement,
        updateAnnouncement,
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
        adminCancelBooking,
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

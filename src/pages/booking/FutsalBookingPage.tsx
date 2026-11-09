import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { CourtSlot, BookingOrder } from '@/types';
import { DatePicker } from '@/components/booking/DatePicker';
import { SlotGrid } from '@/components/booking/SlotGrid';
import { ConfirmationModal } from '@/components/booking/ConfirmationModal';
import { BookingSuccessModal } from '@/components/booking/BookingSuccessModal';
import { Badge } from '@/components/common/Badge';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const FutsalBookingPage: React.FC = () => {
  const { selectedDate, setSelectedDate, slots, userOrders } = useBooking();

  const [selectedSlot, setSelectedSlot] = useState<CourtSlot | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<BookingOrder | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Check if current user already has pending or confirmed bookings on this day
  const userBookingsOnDate = userOrders.filter(
    (o) => o.date === selectedDate && o.sport === 'football' && o.status !== 'rejected' && o.status !== 'expired'
  );

  const handleSlotClick = (slot: CourtSlot) => {
    setSelectedSlot(slot);
    setIsConfirmModalOpen(true);
  };

  const handleBookingConfirmed = (order: BookingOrder) => {
    setConfirmedOrder(order);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-200">
        <div>
          <Link
            to="/book"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Sport Selection
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900">
              Futsal Court Booking
            </h1>
            <Badge variant="brand" size="md">
              Pitch A (5v5 / 6v6)
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-surface-600 mt-1">
            Pick your date and click any available slot to request your reservation.
          </p>
        </div>

        {/* Quick Rate Indicator */}
        <div className="flex items-center gap-3 bg-surface-50 px-4 py-2.5 rounded-xl border border-surface-200 text-xs">
          <div>
            <span className="text-surface-500 block text-[10px] uppercase font-semibold">Base Price</span>
            <span className="font-bold text-surface-900">NPR 1,300</span>
          </div>
          <div className="h-6 w-px bg-surface-200"></div>
          <div>
            <span className="text-brand-800 block text-[10px] uppercase font-semibold">Saturday Rate</span>
            <span className="font-extrabold text-brand-700">NPR 1,500</span>
          </div>
        </div>
      </div>

      {/* User's existing booking status alert for selected day */}
      {userBookingsOnDate.length > 0 && (
        <div className="space-y-2">
          {userBookingsOnDate.map((b) => (
            <div
              key={b.id}
              className={
                b.status === 'confirmed'
                  ? 'flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs'
                  : 'flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs'
              }
            >
              <div className="flex items-center gap-2">
                {b.status === 'confirmed' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  You have a <strong>{b.status.toUpperCase()}</strong> booking on this date for{' '}
                  <strong>{b.startTime} – {b.endTime}</strong>.
                  {b.bookingCode && (
                    <span className="ml-2 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                      Code: {b.bookingCode}
                    </span>
                  )}
                </span>
              </div>
              <Link to="/customer/bookings">
                <span className="font-semibold underline hover:text-emerald-800">
                  View Slip
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Section 1: Date Picker Calendar Carousel */}
      <section className="bg-white rounded-2xl border border-surface-200 p-6 shadow-subtle">
        <DatePicker
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
          daysCount={21}
        />
      </section>

      {/* Section 2: Hourly Slot Selection Grid */}
      <section className="bg-white rounded-2xl border border-surface-200 p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-surface-900 tracking-tight">
              Court Hourly Slots
            </h2>
            <p className="text-xs text-surface-500">
              Slots are 60 minutes in duration. White slots are ready for immediate reservation.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <Clock className="w-4 h-4 text-brand-700" />
            <span>Operating: 06:00 AM – 10:00 PM</span>
          </div>
        </div>

        <SlotGrid
          slots={slots}
          onSelectSlot={handleSlotClick}
          selectedSlot={selectedSlot}
        />
      </section>

      {/* Step 3: Modals */}
      <ConfirmationModal
        slot={selectedSlot}
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedSlot(null);
        }}
        onSuccess={handleBookingConfirmed}
      />

      <BookingSuccessModal
        order={confirmedOrder}
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setConfirmedOrder(null);
        }}
      />

    </div>
  );
};

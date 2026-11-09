import React from 'react';
import { CourtSlot } from '@/types';
import { formatNPR, formatSlotTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Check, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotGridProps {
  slots: CourtSlot[];
  onSelectSlot: (slot: CourtSlot) => void;
  selectedSlot?: CourtSlot | null;
}

export const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  onSelectSlot,
  selectedSlot,
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-5 py-2.5 px-4 bg-surface-50 rounded-xl border border-surface-200 text-xs">
        <span className="font-bold text-surface-800">Status Guide:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-surface-300 bg-white"></div>
          <span className="text-surface-700">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-red-600 border border-red-700"></div>
          <span className="text-surface-700">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-700"></div>
          <span className="text-surface-700">Your Confirmed Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-600"></div>
          <span className="text-surface-700">Under Review</span>
        </div>
      </div>

      {/* Grid of 11 Hourly Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isUserConfirmed =
            slot.status === 'confirmed' && user && slot.userId === user.uid;

          const isUserPending =
            slot.status === 'pending' && user && slot.userId === user.uid;

          const isOtherConfirmed =
            slot.status === 'confirmed' && (!user || slot.userId !== user.uid);

          const isOtherPending =
            slot.status === 'pending' && (!user || slot.userId !== user.uid);

          const isSelected = selectedSlot?.slotId === slot.slotId;

          let cardStyle = '';
          let statusText = '';
          let isClickable = false;

          if (isUserConfirmed) {
            // GREEN: Current customer's confirmed booking
            cardStyle =
              'bg-emerald-600 text-white border-emerald-700 shadow-sm cursor-default ring-2 ring-emerald-500 ring-offset-1';
            statusText = `Your Booking (${slot.bookingCode || 'Confirmed'})`;
            isClickable = false;
          } else if (isUserPending) {
            // AMBER: User's own pending request
            cardStyle =
              'bg-amber-500 text-white border-amber-600 shadow-sm cursor-default';
            statusText = 'Under Review (Pending)';
            isClickable = false;
          } else if (isOtherConfirmed || isOtherPending) {
            // RED: Booked or under review by another customer
            cardStyle =
              'bg-red-600 text-white border-red-700 opacity-90 cursor-not-allowed';
            statusText = isOtherConfirmed ? 'Booked' : 'Under Review';
            isClickable = false;
          } else {
            // WHITE / NEUTRAL: Available
            cardStyle = isSelected
              ? 'bg-white text-surface-900 border-surface-900 ring-2 ring-emerald-600 shadow-md scale-[1.01]'
              : 'bg-white text-surface-900 border-surface-200 hover:border-emerald-600 hover:shadow-subtle cursor-pointer';
            statusText = 'Available';
            isClickable = true;
          }

          return (
            <button
              key={slot.slotId}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectSlot(slot)}
              className={cn(
                'flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left min-h-[96px]',
                cardStyle
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold tracking-tight">
                  {formatSlotTime(slot.startTime, slot.endTime)}
                </span>
                {isUserConfirmed && <Check className="w-4 h-4 shrink-0 text-white" />}
                {isOtherConfirmed && <Lock className="w-3.5 h-3.5 shrink-0 text-white/80" />}
                {isOtherPending && <Clock className="w-3.5 h-3.5 shrink-0 text-white/80" />}
              </div>

              <div className="flex items-end justify-between w-full mt-2 pt-1.5 border-t border-current/15">
                <span className="text-[11px] font-semibold uppercase tracking-tight">
                  {statusText}
                </span>
                {isClickable && (
                  <span className="text-xs font-extrabold text-emerald-800">
                    {formatNPR(slot.price)}
                  </span>
                )}
                {isUserConfirmed && (
                  <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">
                    {slot.bookingCode}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { CourtSlot } from '@/types';
import { formatNPR, formatSlotTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Check, Clock, Lock, ArrowUpRight, Sparkles } from 'lucide-react';
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
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 sm:px-5 bg-surface-50 rounded-2xl border border-surface-200 text-xs">
        <div className="flex items-center gap-2 font-black text-surface-800 uppercase tracking-wider text-[11px]">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Court Slot Guide</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md border-2 border-surface-300 bg-white shadow-sm" />
            <span className="text-surface-700 font-medium">Available (Hover to Book)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-red-600 border border-red-700 shadow-sm" />
            <span className="text-surface-700 font-medium">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-emerald-600 border border-emerald-700 shadow-sm" />
            <span className="text-surface-700 font-medium">Your Confirmed Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-amber-500 border border-amber-600 shadow-sm" />
            <span className="text-surface-700 font-medium">Under Review</span>
          </div>
        </div>
      </div>

      {/* Grid of 11 Hourly Slots with Fluid Hover Motion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
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
              'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-800 shadow-md cursor-default ring-2 ring-emerald-500/50';
            statusText = `Your Booking (${slot.bookingCode || 'Confirmed'})`;
            isClickable = false;
          } else if (isUserPending) {
            // AMBER: User's own pending request
            cardStyle =
              'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-700 shadow-md cursor-default';
            statusText = 'Under Review (Pending)';
            isClickable = false;
          } else if (isOtherConfirmed || isOtherPending) {
            // RED: Booked or under review by another customer
            cardStyle =
              'bg-red-500/95 text-white border-red-700 opacity-80 cursor-not-allowed';
            statusText = isOtherConfirmed ? 'Booked' : 'Under Review';
            isClickable = false;
          } else if (isSelected) {
            // SELECTED STATE: Emerald ring with lift
            cardStyle =
              'bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/40 text-surface-900 border-emerald-600 ring-4 ring-emerald-600/30 shadow-xl -translate-y-1.5 scale-[1.02] cursor-pointer';
            statusText = 'Selected Slot';
            isClickable = true;
          } else {
            // AVAILABLE STATE: Rich interactive hover
            cardStyle =
              'bg-white text-surface-900 border-surface-200 hover:border-emerald-600 hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/40 hover:-translate-y-1.5 hover:shadow-xl hover:ring-2 hover:ring-emerald-500/20 active:scale-[0.98] cursor-pointer';
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
                'group relative flex flex-col justify-between p-4 rounded-2xl border-2 transition-all duration-300 ease-out text-left min-h-[105px] overflow-hidden',
                cardStyle
              )}
            >
              {/* Subtle hover accent shine */}
              {isClickable && !isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              )}

              {/* Time header */}
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs sm:text-sm font-black tracking-tight">
                  {formatSlotTime(slot.startTime, slot.endTime)}
                </span>

                {isUserConfirmed && <Check className="w-4 h-4 shrink-0 text-white" />}
                {isOtherConfirmed && <Lock className="w-3.5 h-3.5 shrink-0 text-white/90" />}
                {isOtherPending && <Clock className="w-3.5 h-3.5 shrink-0 text-white/90" />}

                {isClickable && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded transition-all duration-200 flex items-center gap-0.5',
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'text-surface-400 group-hover:text-emerald-700 group-hover:bg-emerald-100/60'
                    )}
                  >
                    <span>{isSelected ? 'Ready' : 'Book'}</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                )}
              </div>

              {/* Status & Price Footer */}
              <div className="flex items-end justify-between w-full mt-2.5 pt-2 border-t border-current/15">
                <span className="text-[11px] font-bold uppercase tracking-tight flex items-center gap-1">
                  {isClickable && (
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-500'
                      )}
                    />
                  )}
                  {statusText}
                </span>

                {isClickable && (
                  <span className="text-xs sm:text-sm font-black text-emerald-800">
                    {formatNPR(slot.price)}
                  </span>
                )}

                {isUserConfirmed && (
                  <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-md">
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

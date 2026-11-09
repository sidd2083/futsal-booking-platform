import React, { useMemo } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { cn, isSaturdayDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  daysCount?: number;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onSelectDate,
  daysCount = 14,
}) => {
  const dates = useMemo(() => {
    const list: Date[] = [];
    const today = new Date();
    for (let i = 0; i < daysCount; i++) {
      list.push(addDays(today, i));
    }
    return list;
  }, [daysCount]);

  const selectedDateObj = useMemo(() => {
    try {
      return parseISO(selectedDate);
    } catch {
      return new Date();
    }
  }, [selectedDate]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-700" />
          <h3 className="text-base font-bold text-surface-900 tracking-tight">
            Select Match Date
          </h3>
          <span className="text-xs text-surface-500 hidden sm:inline">
            (Today: {format(new Date(), 'EEE, MMM d')})
          </span>
        </div>
        
        {/* Pricing legend hint */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-surface-600">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-300"></span> Normal: <strong>NPR 1,300</strong>
          </span>
          <span className="flex items-center gap-1.5 text-brand-800">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span> Sat: <strong>NPR 1,500</strong>
          </span>
        </div>
      </div>

      {/* Date Carousel List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar">
        {dates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = isSameDay(date, selectedDateObj);
          const isSat = isSaturdayDate(dateStr);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[76px] sm:min-w-[84px] py-3 px-2 rounded-xl border transition-all text-center shrink-0 select-none',
                isSelected
                  ? 'bg-surface-900 text-white border-surface-900 shadow-md ring-2 ring-brand-600 ring-offset-2'
                  : 'bg-white text-surface-700 border-surface-200 hover:border-surface-300 hover:bg-surface-50'
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-bold uppercase tracking-wider',
                  isSelected
                    ? 'text-surface-300'
                    : isSat
                    ? 'text-brand-700 font-extrabold'
                    : 'text-surface-500'
                )}
              >
                {isToday ? 'Today' : format(date, 'EEE')}
              </span>
              <span
                className={cn(
                  'text-xl sm:text-2xl font-extrabold tracking-tight my-0.5',
                  isSelected ? 'text-white' : 'text-surface-900'
                )}
              >
                {format(date, 'd')}
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isSelected ? 'text-surface-300' : 'text-surface-500'
                )}
              >
                {format(date, 'MMM')}
              </span>

              {/* Saturday Rate Tag */}
              {isSat && (
                <span
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0.2 mt-1 rounded-full uppercase tracking-tight',
                    isSelected ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-800'
                  )}
                >
                  Sat Rate
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

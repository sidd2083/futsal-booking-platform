import React, { useMemo } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { cn, isSaturdayDate, getNepalCurrentDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Strictly 7 days window (Today + next 6 days = 7 days total)
  const dates = useMemo(() => {
    const list: Date[] = [];
    const nepalToday = getNepalCurrentDate();
    for (let i = 0; i < 7; i++) {
      list.push(addDays(nepalToday, i));
    }
    return list;
  }, []);

  const selectedDateObj = useMemo(() => {
    try {
      return parseISO(selectedDate);
    } catch {
      return getNepalCurrentDate();
    }
  }, [selectedDate]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-surface-900 tracking-tight">
            Select Match Date
          </h3>
          <span className="text-xs text-surface-500">
            (7-Day Booking Window)
          </span>
        </div>

        {/* Pricing legend hint */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-surface-600">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-300"></span> Normal: <strong>NPR 1,300</strong>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Sat: <strong>NPR 1,500</strong>
          </span>
        </div>
      </div>

      {/* Date Carousel List */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
        {dates.map((date, idx) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = isSameDay(date, selectedDateObj);
          const isSat = isSaturdayDate(dateStr);
          const isToday = idx === 0;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all text-center select-none cursor-pointer',
                isSelected
                  ? 'bg-surface-900 text-white border-surface-900 shadow-sm ring-2 ring-emerald-600 ring-offset-1'
                  : 'bg-white text-surface-700 border-surface-200 hover:border-surface-300 hover:bg-surface-50'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider',
                  isSelected
                    ? 'text-surface-300'
                    : isSat
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-surface-500'
                )}
              >
                {isToday ? 'Today' : format(date, 'EEE')}
              </span>
              <span
                className={cn(
                  'text-lg sm:text-xl font-extrabold tracking-tight my-0.5',
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
                    'text-[8px] font-bold px-1.5 py-0.5 mt-1 rounded-full uppercase tracking-tight',
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
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

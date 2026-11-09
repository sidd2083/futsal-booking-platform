import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount into Nepalese Rupees (NPR).
 * Example: formatNPR(1300) => "NPR 1,300"
 */
export function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString('en-IN')}`;
}

/**
 * Returns current date and time formatted in Nepal Timezone (Asia/Kathmandu).
 */
export function getNepalCurrentDate(): Date {
  // Compute current time adjusted to UTC+5:45 (Nepal Time)
  const now = new Date();
  const utcOffsetMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalOffsetMs = 5.75 * 3600000;
  return new Date(utcOffsetMs + nepalOffsetMs);
}

/**
 * Get YYYY-MM-DD string for today in Nepal time.
 */
export function getNepalTodayFormatted(): string {
  const nepalDate = getNepalCurrentDate();
  const year = nepalDate.getFullYear();
  const month = String(nepalDate.getMonth() + 1).padStart(2, '0');
  const day = String(nepalDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string (YYYY-MM-DD) falls on a Saturday.
 */
export function isSaturdayDate(dateString: string): boolean {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay() === 6; // 6 = Saturday
}

/**
 * Get display time range for a slot.
 * Example: formatSlotTime("10:00", "11:00") => "10:00 AM – 11:00 AM"
 */
export function formatSlotTime(startTime: string, endTime: string): string {
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

/**
 * Dynamically generate hourly slots between opening and closing hours.
 * For Maya Sports Centre: 10:00 AM (10) to 9:00 PM (21), yielding 11 slots.
 */
export function generateHourlySlotDefinitions(startHour = 10, endHour = 21): Array<{ startTime: string; endTime: string; display: string }> {
  const slots: Array<{ startTime: string; endTime: string; display: string }> = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const startStr = `${hour.toString().padStart(2, '0')}:00`;
    const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
    slots.push({
      startTime: startStr,
      endTime: endStr,
      display: formatSlotTime(startStr, endStr),
    });
  }
  return slots;
}

/**
 * Generate a unique random booking verification code.
 * Example: "MS-8421" (Maya Sports prefix)
 */
export function generateBookingCode(sport: 'football' | 'cricket' = 'football'): string {
  const prefix = sport === 'football' ? 'MS' : 'MC';
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
}

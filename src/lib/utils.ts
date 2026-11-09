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
 * Returns current date and time formatted in Nepal Timezone (Asia/Kathmandu, UTC+5:45).
 */
export function getNepalCurrentDate(): Date {
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
 * Check if a slot time has already passed in Nepal local time (UTC+5:45).
 * A slot is considered passed if its START hour <= current Nepal hour.
 * e.g. at 6:08 PM (18:08 Nepal), slots for 10AM, 11AM ... 6PM (18:00) are all past/disabled.
 */
export function isSlotPassedInNepal(dateString: string, startTime: string): boolean {
  const nepalToday = getNepalTodayFormatted();
  if (dateString < nepalToday) return true; // Any past date is blocked
  if (dateString > nepalToday) return false; // Future dates are always open

  // Same day: compare slot start against current Nepal time
  const nepalNow = getNepalCurrentDate();
  const currentHour = nepalNow.getHours();

  const [slotHour] = startTime.split(':').map(Number);

  // Block any slot whose start hour is <= current hour (the hour is either past or already started)
  // This means at 18:08, slot 18:00–19:00 is blocked; slot 19:00–20:00 is open.
  return slotHour <= currentHour;
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

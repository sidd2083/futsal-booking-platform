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
 * Check if a date string (YYYY-MM-DD) falls on a Saturday.
 */
export function isSaturdayDate(dateString: string): boolean {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay() === 6; // 6 = Saturday
}

/**
 * Get display time range for a slot.
 * Example: formatSlotTime("07:00", "08:00") => "07:00 AM - 08:00 AM"
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
 * Generate a unique random booking verification code.
 */
export function generateBookingCode(sport: 'football' | 'cricket' = 'football'): string {
  const prefix = sport === 'football' ? 'FT' : 'CR';
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
}

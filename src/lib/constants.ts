import { PricingConfig } from '@/types';

export const DEFAULT_PRICING: PricingConfig = {
  currency: 'NPR',
  normalDayRate: Number(import.meta.env.VITE_DEFAULT_PRICE_NORMAL_DAY) || 1300,
  saturdayRate: Number(import.meta.env.VITE_DEFAULT_PRICE_SATURDAY) || 1500,
  operatingHours: {
    start: Number(import.meta.env.VITE_OPERATING_HOURS_START) || 6, // 06:00 AM
    end: Number(import.meta.env.VITE_OPERATING_HOURS_END) || 22,   // 10:00 PM
    slotDurationMinutes: 60,
  },
};

export const BUSINESS_INFO = {
  name: 'Kathmandu Arena & Turf',
  shortName: 'Arena Turf',
  tagline: 'Nepal’s Premier Futsal & Cricket Arena',
  location: import.meta.env.VITE_BUSINESS_LOCATION || 'Kathmandu, Nepal (Exact venue details upon verification)',
  phone: import.meta.env.VITE_BUSINESS_PHONE || '+977-98XXXXXXXX',
  email: 'info@futsalbookingnepal.com',
  openHoursDisplay: '06:00 AM – 10:00 PM (Everyday)',
  amenities: [
    { title: 'FIFA Standard Turf', description: 'Premium monofilament artificial turf designed for optimal shock absorption and ball roll.' },
    { title: 'LED Floodlighting', description: 'High-lux flicker-free floodlights for optimal night visibility.' },
    { title: 'Changing & Shower Rooms', description: 'Clean, sanitized locker rooms, showers, and dedicated washrooms.' },
    { title: 'Secure Vehicle Parking', description: 'Spacious on-site parking for two-wheelers and four-wheelers.' },
    { title: 'Café & Hydration Zone', description: 'Chilled energy drinks, mineral water, and light refreshments available on-site.' },
    { title: 'Live Match Viewing Deck', description: 'Elevated spectator viewing gallery with shaded seating.' },
  ],
};

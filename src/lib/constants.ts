import { PricingConfig } from '@/types';

export const DEFAULT_PRICING: PricingConfig = {
  currency: 'NPR',
  normalDayRate: Number(import.meta.env.VITE_DEFAULT_PRICE_NORMAL_DAY) || 1300,
  saturdayRate: Number(import.meta.env.VITE_DEFAULT_PRICE_SATURDAY) || 1500,
  operatingHours: {
    start: Number(import.meta.env.VITE_OPERATING_HOURS_START) || 10, // 10:00 AM
    end: Number(import.meta.env.VITE_OPERATING_HOURS_END) || 21,    // 09:00 PM (11 slots)
    slotDurationMinutes: 60,
  },
};

export const BUSINESS_INFO = {
  name: 'Maya Sports Centre',
  shortName: 'Maya Sports',
  tagline: "Hetauda's No. 1 Sports Centre",
  address: 'C2FW+8VG, Rai Tole Marg, Hetauda, Bagmati Province 44107, Nepal',
  phone: '9714577877',
  phoneDisplay: '+977 9714577877',
  openHoursDisplay: 'Every day: 10:00 AM – 9:00 PM',
  openingDays: '7 days a week',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=C2FW%2B8VG%2C%20Rai%20Tole%20Marg%2C%20Hetauda%2C%20Bagmati%20Province%2044107',
  about:
    'Maya Sports Centre is a sports destination in Hetauda, dedicated to providing quality sports facilities and a great playing experience. We aim to give players, friends, families, and sports enthusiasts a welcoming place to enjoy their game with well-maintained grounds, quality facilities, and affordable pricing.',
  facilities: [
    {
      title: 'Quality Playing Grounds',
      description: 'Even, cushioned surface designed for reliable ball control, player agility, and reduced impact.',
    },
    {
      title: 'Well-Maintained Turf',
      description: 'Regularly cleaned and groomed artificial grass to maintain excellent traction and match consistency.',
    },
    {
      title: 'LED Floodlighting',
      description: 'Clear, flicker-free lighting across the pitch so you can enjoy evening matches from dusk until 9:00 PM.',
    },
    {
      title: 'Parking Facilities',
      description: 'Dedicated on-site parking space for motorcycles and cars right outside the court.',
    },
    {
      title: 'Affordable Pricing',
      description: 'Transparent hourly rates with Pay on Arrival: NPR 1,300 on normal days and NPR 1,500 on Saturdays.',
    },
    {
      title: 'Open 7 Days a Week',
      description: 'Open Monday through Sunday from 10:00 AM to 9:00 PM for scheduled practices and casual games.',
    },
    {
      title: 'Convenient Booking',
      description: 'Live date and slot availability with instant lock and phone verification.',
    },
  ],
};

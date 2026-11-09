import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { BUSINESS_INFO } from '@/lib/constants';
import { MapPin, Phone, Clock, ArrowRight, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-900 text-surface-300 pt-16 pb-12 border-t border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-surface-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Logo variant="dark" size="lg" />
            <p className="text-xs text-surface-400 leading-relaxed">
              {BUSINESS_INFO.tagline}. A dedicated sports destination in Hetauda providing quality playing grounds, well-maintained turf, and convenient Pay on Arrival reservations.
            </p>
            <div className="pt-1">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 group"
              >
                Book Your Slot Today <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Rates & Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">
              Rates & Operating Hours
            </h4>
            <div className="space-y-2 text-xs text-surface-400">
              <div className="flex items-center justify-between py-1.5 border-b border-surface-800">
                <span>Sunday – Friday</span>
                <span className="font-bold text-white">NPR 1,300 / hr</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-surface-800">
                <span>Saturday Rate</span>
                <span className="font-bold text-emerald-400">NPR 1,500 / hr</span>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium block">10:00 AM – 9:00 PM</span>
                  <span className="text-[11px] text-surface-500">Open 7 days a week (11 hourly slots)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/book" className="hover:text-white transition-colors">
                  Online Court Booking
                </Link>
              </li>
              <li>
                <a href="/#about" className="hover:text-white transition-colors">
                  About Maya Sports Centre
                </a>
              </li>
              <li>
                <a href="/#facilities" className="hover:text-white transition-colors">
                  Turf & Facilities
                </a>
              </li>
              <li>
                <a href="/#gallery" className="hover:text-white transition-colors">
                  Venue Gallery
                </a>
              </li>
              <li>
                <Link to="/customer/bookings" className="hover:text-white transition-colors">
                  My Bookings & Verification Code
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-surface-500 hover:text-surface-300 transition-colors">
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Telephone Link */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">
              Venue Location & Contact
            </h4>
            <div className="space-y-2.5 text-xs text-surface-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-medium">Hetauda, Nepal</span>
                  <span className="text-surface-400 text-[11px]">{BUSINESS_INFO.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="text-white font-bold hover:text-emerald-400 transition-colors"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </div>

              <div className="pt-2">
                <a
                  href={BUSINESS_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-300 hover:text-white transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <div>
            © {new Date().getFullYear()} Maya Sports Centre. All rights reserved.
          </div>
          <div>
            Hetauda, Bagmati Province, Nepal • Currency: NPR
          </div>
        </div>

      </div>
    </footer>
  );
};

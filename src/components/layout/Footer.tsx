import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-900 text-surface-300 pt-16 pb-12 border-t border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-surface-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white font-bold text-lg">
                KT
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                KATHMANDU <span className="text-brand-400">TURF</span>
              </span>
            </div>
            <p className="text-sm text-surface-400 leading-relaxed">
              Nepal’s standard futsal facility offering FIFA-grade artificial turf, championship LED illumination, and real-time instant court reservations.
            </p>
            <div className="pt-2">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 group"
              >
                Reserve Your Pitch Today <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Pricing & Hours Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">
              Rates & Hours
            </h4>
            <div className="space-y-2 text-xs text-surface-400">
              <div className="flex items-center justify-between py-1.5 border-b border-surface-800">
                <span>Normal Days (Sun–Fri)</span>
                <span className="font-bold text-brand-400">NPR 1,300 / hr</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-surface-800">
                <span>Saturday (Peak Day)</span>
                <span className="font-bold text-emerald-400">NPR 1,500 / hr</span>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <Clock className="w-4 h-4 text-surface-500 shrink-0 mt-0.5" />
                <span>06:00 AM – 10:00 PM (Daily)</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Col */}
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
                  About Our Facility
                </a>
              </li>
              <li>
                <a href="/#amenities" className="hover:text-white transition-colors">
                  Pitch Turf & Amenities
                </a>
              </li>
              <li>
                <a href="/#gallery" className="hover:text-white transition-colors">
                  Photo Gallery
                </a>
              </li>
              <li>
                <Link to="/customer/bookings" className="hover:text-white transition-colors">
                  Customer Booking Slip
                </Link>
              </li>
            </ul>
          </div>

          {/* Venue Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">
              Venue Location
            </h4>
            <div className="space-y-2.5 text-xs text-surface-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Kathmandu, Nepal <span className="text-[10px] text-surface-500 block">(Exact address to be confirmed by owner)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+977-98XXXXXXXX <span className="text-[10px] text-surface-500">(Placeholder)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>info@futsalbookingnepal.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <div>
            © {new Date().getFullYear()} Kathmandu Arena & Turf. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-surface-500">
              Currency: Nepalese Rupees (NPR) • Pay on Arrival
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

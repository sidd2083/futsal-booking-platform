import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const SportSelectPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <Badge variant="brand" size="md">
          Court Reservation Gateway
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-surface-900 mt-3">
          Select Your Sport
        </h1>
        <p className="text-sm sm:text-base text-surface-600 mt-3 leading-relaxed">
          Choose a discipline to view real-time hourly court availability, dynamic pricing, and instant slot reservations.
        </p>
      </div>

      {/* Two Sport Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* CARD 1: FOOTBALL / FUTSAL (ACTIVE) */}
        <div className="relative flex flex-col justify-between bg-white rounded-2xl border-2 border-brand-600 p-8 shadow-card hover:shadow-floating transition-all duration-200 group">
          
          {/* Active status badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-tight">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Booking Active
            </span>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
              NPR 1,300 – 1,500 / hr
            </span>
          </div>

          {/* Graphic Icon */}
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
            <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Football / Futsal
            </h2>
            <p className="text-xs sm:text-sm text-surface-600 leading-relaxed">
              Full-size tournament pitch equipped with 50mm shock-absorbent artificial turf, enclosed perimeter netting, and FIFA futsal dimensions.
            </p>

            <ul className="space-y-2 pt-2 text-xs text-surface-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                <span>5v5 and 6v6 match play configurations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                <span>Pay on Arrival at counter — No advance deposit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                <span>Guaranteed single-source atomic slot locking</span>
              </li>
            </ul>
          </div>

          {/* CTA Action */}
          <Link to="/book/futsal" className="block w-full">
            <Button
              size="lg"
              variant="primary"
              className="w-full font-bold shadow-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Select Futsal & View Slots
            </Button>
          </Link>
        </div>

        {/* CARD 2: CRICKET (COMING SOON) */}
        <div className="relative flex flex-col justify-between bg-surface-50 rounded-2xl border border-surface-200 p-8 opacity-85 shadow-subtle hover:border-surface-300 transition-all">
          
          {/* Coming Soon status badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-200 text-surface-700 text-xs font-bold uppercase tracking-tight">
              <Clock className="w-3.5 h-3.5 text-surface-500" />
              Coming Soon
            </span>
            <span className="text-xs font-semibold text-surface-500 bg-surface-200 px-2.5 py-1 rounded-lg">
              Under Development
            </span>
          </div>

          {/* Graphic Icon */}
          <div className="w-16 h-16 rounded-2xl bg-surface-200 text-surface-600 flex items-center justify-center mb-6">
            {/* Cricket bat & ball custom SVG */}
            <svg className="w-8 h-8 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 20l10-10M14 10l2-2 4 4-2 2-4-4z" />
              <circle cx="19" cy="5" r="2" fill="currentColor" />
            </svg>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-700 tracking-tight">
              Cricket Turf Nets
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 leading-relaxed">
              Dedicated indoor box cricket arena with professional bowling pitch turf, high-tension safety netting, and automatic bowling machine compatibility.
            </p>

            <ul className="space-y-2 pt-2 text-xs text-surface-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-400"></span>
                <span>Box cricket matches and batting practice nets</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-400"></span>
                <span>Automated slot reservation engine in development</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-400"></span>
                <span>Launching in upcoming platform milestone</span>
              </li>
            </ul>
          </div>

          {/* Disabled action with notification prompt */}
          <div>
            <Button
              size="lg"
              variant="outline"
              disabled
              className="w-full text-surface-400 cursor-not-allowed bg-surface-100"
            >
              Cricket Booking Unavailable
            </Button>
            <p className="text-[11px] text-surface-500 text-center mt-2">
              Registration opens upon completion of turf net installation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

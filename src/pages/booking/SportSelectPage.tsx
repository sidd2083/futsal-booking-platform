import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { BUSINESS_INFO } from '@/lib/constants';
import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── REALISTIC ANIMATED FOOTBALL ON TURF PITCH ─── */
const FootballAnimation: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-emerald-950/5 via-emerald-900/10 to-emerald-800/15 border border-emerald-100/80">
      {/* Background futsal field lines (subtle pitch) */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 400 180" preserveAspectRatio="none">
        <line x1="20" y1="90" x2="380" y2="90" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="200" cy="90" r="45" fill="none" stroke="#059669" strokeWidth="1.5" />
        <circle cx="200" cy="90" r="3" fill="#059669" />
        <rect x="20" y="20" width="360" height="140" fill="none" stroke="#059669" strokeWidth="1.5" rx="6" />
      </svg>

      {/* Speed lines on hover */}
      <div
        className={cn(
          'absolute left-1/4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 transition-all duration-300 pointer-events-none',
          isHovered ? 'opacity-100 -translate-x-2' : 'opacity-0 translate-x-4'
        )}
      >
        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-emerald-600 animate-pulse" />
        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-emerald-300 to-emerald-500 animate-pulse delay-75" />
        <div className="w-12 h-1 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-emerald-600 animate-pulse delay-150" />
      </div>

      {/* Ball Shadow */}
      <div
        className={cn(
          'absolute bottom-5 w-20 h-4 rounded-full bg-emerald-950/25 blur-sm transition-all duration-500',
          isHovered ? 'w-24 opacity-40 translate-x-3 scale-95' : 'w-16 opacity-60 animate-pulse'
        )}
      />

      {/* 3D Soccer Ball */}
      <div
        className={cn(
          'relative z-10 transition-all duration-500 ease-out transform',
          isHovered ? 'translate-x-3 -translate-y-2 scale-110' : 'animate-bounce'
        )}
        style={{ animationDuration: '2.4s' }}
      >
        <svg
          viewBox="0 0 100 100"
          className={cn(
            'w-24 h-24 drop-shadow-xl transition-transform duration-700',
            isHovered ? 'rotate-[140deg]' : 'rotate-12'
          )}
        >
          <defs>
            {/* Sphere 3D shading */}
            <radialGradient id="ballShading" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#f1f5f9" />
              <stop offset="85%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>

            {/* Specular gloss */}
            <linearGradient id="specular" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sphere body */}
          <circle cx="50" cy="50" r="46" fill="url(#ballShading)" stroke="#94a3b8" strokeWidth="1" />

          {/* Center Black Pentagon */}
          <polygon points="50,32 63,42 58,58 42,58 37,42" fill="#0f172a" />

          {/* Seam lines radiating from center pentagon */}
          <line x1="50" y1="32" x2="50" y2="18" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <line x1="63" y1="42" x2="76" y2="38" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="58" x2="68" y2="70" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="58" x2="32" y2="70" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <line x1="37" y1="42" x2="24" y2="38" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

          {/* Outer edge black patches */}
          <polygon points="50,6 40,16 60,16" fill="#0f172a" />
          <polygon points="86,30 76,38 80,50 94,40" fill="#0f172a" />
          <polygon points="76,82 68,70 78,62 88,72" fill="#0f172a" />
          <polygon points="24,82 32,70 22,62 12,72" fill="#0f172a" />
          <polygon points="14,30 24,38 20,50 6,40" fill="#0f172a" />
          <polygon points="42,94 58,94 50,84" fill="#0f172a" />

          {/* Surface shine gloss */}
          <ellipse cx="36" cy="30" rx="14" ry="8" fill="url(#specular)" transform="rotate(-30 36 30)" />
        </svg>
      </div>

      {/* Floating Sparkle indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700/10 text-emerald-800 text-[11px] font-bold">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>Match Pitch</span>
      </div>
    </div>
  );
};

/* ─── REALISTIC ANIMATED CRICKET TURF WITH LEATHER BALL & WICKETS ─── */
const CricketAnimation: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-amber-950/5 via-amber-900/10 to-amber-800/15 border border-amber-200/80">
      {/* Background Pitch Crease & Stumps */}
      <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" viewBox="0 0 400 180">
        {/* Pitch boundary rectangle */}
        <rect x="60" y="25" width="280" height="130" fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 3" rx="4" />
        {/* Popping Crease line */}
        <line x1="120" y1="25" x2="120" y2="155" stroke="#b45309" strokeWidth="2" />
        {/* Cricket Wickets / Stumps */}
        <rect x="106" y="55" width="4" height="65" fill="#78350f" rx="1" />
        <rect x="114" y="55" width="4" height="65" fill="#78350f" rx="1" />
        <rect x="122" y="55" width="4" height="65" fill="#78350f" rx="1" />
        {/* Bails on top */}
        <rect x="104" y="52" width="24" height="3" fill="#92400e" rx="1" />
      </svg>

      {/* Fast Bowling Speed Streaks on hover */}
      <div
        className={cn(
          'absolute left-1/3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 transition-all duration-300 pointer-events-none',
          isHovered ? 'opacity-100 -translate-x-3' : 'opacity-0 translate-x-2'
        )}
      >
        <div className="w-20 h-1 rounded-full bg-gradient-to-r from-transparent via-red-400 to-red-600 animate-pulse" />
        <div className="w-28 h-1 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-red-500 animate-pulse delay-75" />
      </div>

      {/* Ball Shadow */}
      <div
        className={cn(
          'absolute bottom-5 w-16 h-3.5 rounded-full bg-amber-950/25 blur-sm transition-all duration-500',
          isHovered ? 'w-20 opacity-40 translate-x-4 scale-95' : 'w-14 opacity-50 animate-pulse'
        )}
      />

      {/* 3D Red Leather Cricket Ball */}
      <div
        className={cn(
          'relative z-10 transition-all duration-500 ease-out transform',
          isHovered ? 'translate-x-5 -translate-y-1 scale-110' : 'hover:scale-105'
        )}
      >
        <svg
          viewBox="0 0 100 100"
          className={cn(
            'w-22 h-22 drop-shadow-xl transition-all duration-700',
            isHovered ? 'rotate-[360deg]' : 'rotate-[25deg]'
          )}
        >
          <defs>
            {/* Rich Red Leather Gradient */}
            <radialGradient id="leatherShading" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="45%" stopColor="#b91c1c" />
              <stop offset="80%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>

            {/* Leather Gloss Highlight */}
            <linearGradient id="leatherGloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sphere body */}
          <circle cx="50" cy="50" r="44" fill="url(#leatherShading)" stroke="#7f1d1d" strokeWidth="1" />

          {/* White Raised Seam Line (Center Axis) */}
          <path
            d="M50,6 C58,30 58,70 50,94"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M50,6 C42,30 42,70 50,94"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Seam Stitching details */}
          {[16, 24, 32, 40, 48, 56, 64, 72, 80].map((y) => (
            <line
              key={y}
              x1="45"
              y1={y}
              x2="55"
              y2={y + 3}
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}

          {/* Leather reflection shine */}
          <ellipse cx="36" cy="28" rx="14" ry="7" fill="url(#leatherGloss)" transform="rotate(-30 36 28)" />
        </svg>
      </div>

      {/* Planning phase pill */}
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-800/10 text-amber-900 text-[11px] font-bold">
        <Clock className="w-3.5 h-3.5 text-amber-700" />
        <span>Nets Planning</span>
      </div>
    </div>
  );
};

/* ─── MAIN SPORT SELECTION PAGE ─── */
export const SportSelectPage: React.FC = () => {
  const [footballHovered, setFootballHovered] = useState(false);
  const [cricketHovered, setCricketHovered] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          {BUSINESS_INFO.tagline}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-surface-900">
          Choose Your Sport
        </h1>
        <p className="text-sm sm:text-base text-surface-600 mt-3 leading-relaxed">
          Select a sport to view our live 7-day court schedule, check open slots, and reserve in seconds.
        </p>
      </div>

      {/* Two Sport Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        {/* CARD 1: FOOTBALL / FUTSAL (ACTIVE LIVE) */}
        <div
          className="relative flex flex-col justify-between bg-white rounded-3xl border-2 border-emerald-600 p-6 sm:p-8 shadow-card hover:shadow-2xl transition-all duration-300 group cursor-pointer"
          onMouseEnter={() => setFootballHovered(true)}
          onMouseLeave={() => setFootballHovered(false)}
        >
          <div>
            {/* Header badges */}
            <div className="flex items-center justify-between mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-extrabold uppercase tracking-tight shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                Live Booking Open
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                NPR 1,300 – 1,500 / hr
              </span>
            </div>

            {/* Interactive Animated Illustration */}
            <div className="mb-6">
              <FootballAnimation isHovered={footballHovered} />
            </div>

            {/* Title & Description */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">
                  Football / Futsal
                </h2>
                <span className="text-xs font-bold text-surface-500 uppercase">11 Slots Daily</span>
              </div>

              <p className="text-xs sm:text-sm text-surface-600 leading-relaxed">
                Premium synthetic turf with bright evening LED floodlights. Open 7 days a week from 10:00 AM to 9:00 PM.
              </p>

              {/* Facility Highlights Checklist */}
              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-surface-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>11 Hourly Slots Daily</strong> across a rolling 7-day calendar</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Pay on Arrival or Pay Online</strong> with eSewa / Khalti</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Instant Lock</strong> prevents double-booking disputes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action CTA */}
          <Link to="/book/futsal" className="block w-full pt-4">
            <Button
              size="lg"
              variant="primary"
              className="w-full font-black text-sm sm:text-base py-3.5 bg-emerald-700 hover:bg-emerald-800 shadow-md group-hover:scale-[1.02] transition-transform"
              rightIcon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
            >
              Select Futsal &amp; View Slots
            </Button>
          </Link>
        </div>

        {/* CARD 2: CRICKET TURF NETS (COMING SOON) */}
        <div
          className="relative flex flex-col justify-between bg-surface-50/80 rounded-3xl border border-surface-200 p-6 sm:p-8 shadow-subtle group hover:border-amber-300 transition-all duration-300"
          onMouseEnter={() => setCricketHovered(true)}
          onMouseLeave={() => setCricketHovered(false)}
        >
          <div>
            {/* Header badges */}
            <div className="flex items-center justify-between mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-200 text-surface-700 text-xs font-bold uppercase tracking-tight">
                <Clock className="w-3.5 h-3.5 text-surface-500" />
                Coming Soon
              </span>
              <span className="text-xs font-semibold text-surface-500 bg-surface-200/80 px-3 py-1.5 rounded-xl">
                Facility in Planning
              </span>
            </div>

            {/* Interactive Animated Illustration */}
            <div className="mb-6">
              <CricketAnimation isHovered={cricketHovered} />
            </div>

            {/* Title & Description */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-black text-surface-700 tracking-tight">
                  Cricket Turf Nets
                </h2>
                <span className="text-xs font-bold text-surface-400 uppercase">Under Dev</span>
              </div>

              <p className="text-xs sm:text-sm text-surface-500 leading-relaxed">
                Dedicated outdoor batting practice nets and bowling lane planned for players, academies, and clubs in Hetauda.
              </p>

              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-surface-500">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-surface-400 shrink-0" />
                  <span>Quality turf batting pitch with full bowling run-up</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-surface-400 shrink-0" />
                  <span>High-safety netting for leather and tennis ball cricket</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-surface-400 shrink-0" />
                  <span>Hourly booking will launch once net installation finishes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Disabled action button */}
          <div className="pt-4">
            <Button
              size="lg"
              variant="outline"
              disabled
              className="w-full text-surface-400 cursor-not-allowed bg-surface-100/80 font-bold"
            >
              Cricket Booking Unavailable
            </Button>
            <p className="text-[11px] text-surface-500 text-center mt-2.5">
              Online reservations will open immediately upon court commissioning.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

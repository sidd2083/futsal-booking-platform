import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Calendar,
  Clock,
  Award,
  Zap,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight,
  Users,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 overflow-hidden bg-gradient-to-b from-surface-50 via-white to-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 pb-16 sm:pb-24">
          
          {/* Pill announcement badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
            <span>Real-Time Court Availability • Kathmandu, Nepal</span>
          </div>

          {/* High-impact headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-surface-900 max-w-4xl mx-auto leading-[1.08]">
            Premium Turf. Instant Slots.{' '}
            <span className="text-brand-700 block sm:inline">Zero Friction.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-surface-600 max-w-2xl mx-auto mt-6 leading-relaxed">
            Reserve professional futsal courts in seconds. Check live hourly slots, submit your booking, and pay on arrival at the counter.
          </p>

          {/* Pricing Highlight Pill */}
          <div className="flex flex-wrap items-center justify-center gap-4 my-8 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-surface-200 shadow-subtle">
              <span className="text-surface-500">Normal Days:</span>
              <span className="text-surface-900 font-bold">NPR 1,300 / hr</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 border border-brand-200 shadow-subtle">
              <span className="text-brand-800 font-semibold">Saturday (Peak):</span>
              <span className="text-brand-900 font-extrabold">NPR 1,500 / hr</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link to="/book" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto px-8 py-3.5 text-base shadow-card font-bold"
                leftIcon={<Calendar className="w-5 h-5" />}
              >
                Book Your Slot Now
              </Button>
            </Link>
            <a href="#amenities" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-6 py-3.5 text-base"
              >
                Explore Pitch Specs
              </Button>
            </a>
          </div>

          {/* Key Value Guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 pt-10 border-t border-surface-200 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs uppercase tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5" /> FIFA-Grade Turf
              </div>
              <p className="text-xs text-surface-500">50mm cushioned monofilament</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs uppercase tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5" /> High-Lux Lights
              </div>
              <p className="text-xs text-surface-500">Flicker-free night play</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs uppercase tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5" /> Guaranteed Lock
              </div>
              <p className="text-xs text-surface-500">Zero double bookings</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs uppercase tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pay on Arrival
              </div>
              <p className="text-xs text-surface-500">No advance payment needed</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <Badge variant="brand" size="md">
              About Kathmandu Arena & Turf
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 leading-tight">
              Engineered for Serious Players & Weekend Warriors Alike.
            </h2>
            <p className="text-surface-600 leading-relaxed">
              We built our futsal arena with one singular goal: to give football enthusiasts in Nepal an unmatched playing environment. From international-standard turf specifications to high-output floodlights and pristine amenities, every detail is crafted for peak athletic performance.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-surface-900">Shock-Absorbing Underlay</h4>
                  <p className="text-xs text-surface-500">Designed to protect player knees and ankles against impact stress.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-surface-900">Tournament Dimension Court</h4>
                  <p className="text-xs text-surface-500">Standard 5v5 and 6v6 field dimensions with official FIFA futsal markings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-surface-900">Covered Weather Protection</h4>
                  <p className="text-xs text-surface-500">Rain or shine, play without weather disruptions under covered turf netting.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/book">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Check Slot Availability
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="bg-surface-50 rounded-2xl border border-surface-200 p-8 shadow-card space-y-6">
            <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
              {/* Pitch Marking Graphics */}
              <div className="absolute inset-4 border-2 border-white/30 rounded-lg flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-white/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/60"></div>
                </div>
                <div className="absolute inset-y-0 left-1/2 border-r-2 border-white/30"></div>
              </div>
              <span className="relative z-10 text-xs uppercase font-bold tracking-widest text-emerald-300 mb-1">
                Pitch Dimensions
              </span>
              <span className="relative z-10 text-2xl font-extrabold tracking-tight">
                38m × 18m Court
              </span>
              <span className="relative z-10 text-xs text-emerald-200/80 mt-1">
                Standard 5v5 & 6v6 Match Play
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-surface-200">
                <span className="text-2xl font-extrabold text-surface-900 block">500+</span>
                <span className="text-xs text-surface-500 font-medium">Matches Played Monthly</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-surface-200">
                <span className="text-2xl font-extrabold text-brand-700 block">16</span>
                <span className="text-xs text-surface-500 font-medium">Hourly Slots Every Day</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. AMENITIES & SPECIFICATIONS */}
      <section id="amenities" className="bg-surface-50 py-20 border-y border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="brand" size="md">
              Facility Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 mt-3">
              Everything You Need for a Seamless Match
            </h2>
            <p className="text-sm text-surface-600 mt-2">
              We provide complete on-site amenities so players can focus entirely on the game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUSINESS_INFO.amenities.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-surface-200 p-6 shadow-subtle hover:shadow-card transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm mb-4">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-surface-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-surface-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. GALLERY SHOWCASE */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="brand" size="md">
            Visual Tour
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 mt-3">
            Arena & Facility Gallery
          </h2>
          <p className="text-sm text-surface-600 mt-2">
            Explore our playing field, evening lighting, spectator area, and locker facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="group rounded-2xl border border-surface-200 bg-white overflow-hidden shadow-subtle hover:shadow-card transition-all">
            <div className="h-48 bg-gradient-to-br from-emerald-900 to-surface-900 flex items-center justify-center text-emerald-300 p-4 text-center">
              <div>
                <Award className="w-10 h-10 mx-auto mb-2 opacity-80" />
                <span className="text-sm font-bold text-white block">Main Pitch A</span>
                <span className="text-xs text-surface-400">High-Density Artificial Turf</span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-surface-900">Championship Turf Surface</h4>
              <p className="text-xs text-surface-500 mt-1">Regularly brushed and sanitized rubber infill for true ball movement.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl border border-surface-200 bg-white overflow-hidden shadow-subtle hover:shadow-card transition-all">
            <div className="h-48 bg-gradient-to-br from-slate-900 to-emerald-950 flex items-center justify-center text-amber-300 p-4 text-center">
              <div>
                <Zap className="w-10 h-10 mx-auto mb-2 opacity-80" />
                <span className="text-sm font-bold text-white block">Floodlit Night Matches</span>
                <span className="text-xs text-surface-400">High-Lux Stadium LED Array</span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-surface-900">Prime-Time Night Vision</h4>
              <p className="text-xs text-surface-500 mt-1">Zero blind spots or glare during evening 07:00 PM to 10:00 PM matches.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl border border-surface-200 bg-white overflow-hidden shadow-subtle hover:shadow-card transition-all">
            <div className="h-48 bg-gradient-to-br from-surface-800 to-surface-950 flex items-center justify-center text-emerald-400 p-4 text-center">
              <div>
                <Users className="w-10 h-10 mx-auto mb-2 opacity-80" />
                <span className="text-sm font-bold text-white block">Locker & Changing Rooms</span>
                <span className="text-xs text-surface-400">Sanitized Showers & Restrooms</span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-surface-900">Clean Athlete Amenities</h4>
              <p className="text-xs text-surface-500 mt-1">Secure personal item lockers and clean post-match shower stalls.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. LOCATION & CONTACT SECTION */}
      <section id="location" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-50 rounded-2xl border border-surface-200 p-8 sm:p-12 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left: Venue info */}
            <div className="space-y-6">
              <div>
                <Badge variant="brand" size="md">
                  Location & Directions
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900 mt-2">
                  Visit Our Venue in Kathmandu
                </h3>
                <p className="text-xs text-surface-500 mt-1">
                  * Note: Exact physical address and landmark will be updated upon official business verification.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-surface-200">
                  <MapPin className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-surface-900 block">Kathmandu Valley, Nepal</span>
                    <span className="text-xs text-surface-500">Accessible from major ring-road corridors with dedicated parking.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-surface-200">
                  <Clock className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-surface-900 block">Daily Operating Schedule</span>
                    <span className="text-xs text-surface-500">Open 7 days a week: 06:00 AM – 10:00 PM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-surface-200">
                  <Phone className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-surface-900 block">Staff Telephone / WhatsApp</span>
                    <span className="text-xs text-surface-500">+977-98XXXXXXXX (Placeholder)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Inquiry Form */}
            <div id="contact" className="bg-white rounded-xl border border-surface-200 p-6 shadow-subtle space-y-4">
              <h4 className="text-base font-bold text-surface-900">
                Send an Inquiry or Feedback
              </h4>
              <p className="text-xs text-surface-500">
                Interested in hosting a corporate tournament or recurring league? Get in touch with our operations team.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your inquiry has been recorded.'); }} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-surface-500 mb-1">Your Name</label>
                  <input type="text" required placeholder="Full Name" className="w-full px-3 py-2 text-xs rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-surface-500 mb-1">Contact Phone</label>
                  <input type="tel" required placeholder="98XXXXXXXX" className="w-full px-3 py-2 text-xs rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-surface-500 mb-1">Message</label>
                  <textarea rows={3} placeholder="Tournament inquiries, recurring weekly slots, etc." className="w-full px-3 py-2 text-xs rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
                </div>
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Submit Inquiry
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-floating">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready for Kick-off?
            </h2>
            <p className="text-sm sm:text-base text-emerald-200 leading-relaxed">
              Check live slots for today or upcoming dates. Lock your hour in 30 seconds with zero prepayment.
            </p>
            <div className="pt-2">
              <Link to="/book">
                <Button
                  size="lg"
                  className="bg-white text-surface-900 hover:bg-surface-100 font-bold px-8 shadow-card text-base"
                  rightIcon={<ArrowRight className="w-4 h-4 text-brand-700" />}
                >
                  Book Your Slot Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

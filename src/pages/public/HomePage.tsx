import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;
    setInquirySubmitted(true);
    setInquiryName('');
    setInquiryPhone('');
    setInquiryMessage('');
    setTimeout(() => setInquirySubmitted(false), 4000);
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section id="home" className="relative pt-12 sm:pt-20 lg:pt-24 pb-16 sm:pb-24 bg-gradient-to-b from-surface-50 via-white to-white border-b border-surface-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Natural Positioning Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>{BUSINESS_INFO.tagline} • Hetauda, Nepal</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-surface-900 max-w-4xl mx-auto leading-[1.08]">
            Hetauda's Premier Futsal Ground.{' '}
            <span className="text-emerald-700 block sm:inline">Ready When You Are.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto mt-6 leading-relaxed">
            Experience Hetauda's leading sports destination. Well-maintained playing turf, bright evening LED floodlights, and instant 1-hour court reservations with Pay on Arrival.
          </p>

          {/* Transparent Pricing Callout */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-8 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-200 shadow-subtle">
              <span className="text-surface-500">Sunday – Friday:</span>
              <span className="text-surface-900 font-bold">NPR 1,300 / hr</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-subtle">
              <span className="text-emerald-800 font-semibold">Saturday:</span>
              <span className="text-emerald-900 font-extrabold">NPR 1,500 / hr</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-200 shadow-subtle text-surface-600">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>10:00 AM – 9:00 PM Daily</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link to="/book" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-bold bg-emerald-700 hover:bg-emerald-800 shadow-card"
                leftIcon={<Calendar className="w-5 h-5" />}
              >
                Book Your Slot
              </Button>
            </Link>
            <a href="#about" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold"
              >
                About Our Centre
              </Button>
            </a>
          </div>

          {/* Key Ground Truth Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 pt-10 border-t border-surface-200 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Well-Maintained Turf
              </div>
              <p className="text-xs text-surface-500">Regularly cleaned and groomed</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> LED Floodlighting
              </div>
              <p className="text-xs text-surface-500">Play until 9:00 PM every night</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Parking
              </div>
              <p className="text-xs text-surface-500">On-site vehicle space</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pay on Arrival
              </div>
              <p className="text-xs text-surface-500">No prepayment barrier</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="brand" size="md">
              About Maya Sports Centre
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-surface-900 leading-tight">
              A Welcoming Sports Destination in Hetauda.
            </h2>
            <p className="text-surface-600 leading-relaxed text-base">
              Maya Sports Centre is a sports destination in Hetauda, dedicated to providing quality sports facilities and a great playing experience. We aim to give players, friends, families, and sports enthusiasts a welcoming place to enjoy their game with well-maintained grounds, quality facilities, and affordable pricing.
            </p>
            <p className="text-surface-600 leading-relaxed text-sm">
              As one of Hetauda’s leading sports destinations, we operate seven days a week with consistent opening hours from 10:00 AM to 9:00 PM. Whether you are gathering a regular squad after work, organizing weekend friendlies, or keeping active, our court is ready for you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <span className="font-bold text-surface-900 block mb-0.5">Open 7 Days a Week</span>
                <span className="text-surface-500">Consistent access Monday through Sunday.</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <span className="font-bold text-surface-900 block mb-0.5">Pay on Arrival</span>
                <span className="text-surface-500">Reserve your hour online, settle at the counter.</span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/book">
                <Button variant="primary" size="md" className="bg-emerald-700 hover:bg-emerald-800 font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Check Slot Availability
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5 bg-surface-50 rounded-2xl border border-surface-200 p-4 sm:p-6 shadow-card space-y-4">
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden relative shadow-md group">
              <img
                src="/images/turf-lighting-night.webp"
                alt="Maya Sports Centre Covered Turf Arena"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                  Actual Playing Ground
                </span>
                <h3 className="text-xl font-black tracking-tight">
                  Maya Sports Centre
                </h3>
                <span className="text-xs text-surface-200 font-medium">
                  {BUSINESS_INFO.tagline} • Hetauda
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-surface-200 shadow-subtle">
                <span className="text-lg font-black text-surface-900 block">11 Slots</span>
                <span className="text-[11px] text-surface-500 font-medium">10 AM – 9 PM Daily</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-surface-200 shadow-subtle">
                <span className="text-lg font-black text-emerald-700 block">Covered Arena</span>
                <span className="text-[11px] text-surface-500 font-medium">All-Weather Play</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FACILITIES & SERVICES SECTION */}
      <section id="facilities" className="bg-surface-50 py-20 border-y border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="brand" size="md">
              Facilities & Services
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 mt-2">
              Everything Ready for a Great Match
            </h2>
            <p className="text-xs sm:text-sm text-surface-600 mt-2">
              We focus on what genuinely matters: a clean, well-cared-for turf surface, good lighting, and reliable booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BUSINESS_INFO.facilities.map((facility, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-surface-200 p-6 shadow-subtle hover:border-surface-300 transition-all space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs mb-3">
                  0{idx + 1}
                </div>
                <h3 className="text-sm font-bold text-surface-900">
                  {facility.title}
                </h3>
                <p className="text-xs text-surface-600 leading-relaxed">
                  {facility.description}
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
            Facility Gallery
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-surface-900 mt-2">
            The Pitch & Grounds
          </h2>
          <p className="text-xs sm:text-sm text-surface-600 mt-2">
            Tasteful visual previews of our playing turf, floodlighting, and surrounding facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Normal Turf Playing Ground (Futsal in action) */}
          <div className="rounded-3xl border border-surface-200 bg-white overflow-hidden shadow-card hover:shadow-floating transition-all duration-300 group">
            <div className="aspect-[4/3] w-full overflow-hidden relative bg-surface-900">
              <img
                src="/images/futsal-turf-match.webp"
                alt="Maya Sports Centre Daytime Match Turf"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-900/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-emerald-500/30">
                Match Turf Ground
              </span>
            </div>
            <div className="p-5 space-y-1">
              <h4 className="text-sm font-black text-surface-900">Covered Futsal Turf Pitch</h4>
              <p className="text-xs text-surface-500 leading-relaxed">
                Full-size synthetic turf with spectator seating, perimeter netting, and comfortable footing.
              </p>
            </div>
          </div>

          {/* Card 2: LED Evening Floodlighting */}
          <div className="rounded-3xl border border-surface-200 bg-white overflow-hidden shadow-card hover:shadow-floating transition-all duration-300 group">
            <div className="aspect-[4/3] w-full overflow-hidden relative bg-surface-900">
              <img
                src="/images/turf-lighting-night.webp"
                alt="Maya Sports Centre LED Floodlights at Night"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-900/90 text-amber-200 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-amber-500/30">
                Evening Floodlights
              </span>
            </div>
            <div className="p-5 space-y-1">
              <h4 className="text-sm font-black text-surface-900">Bright LED Night Visibility</h4>
              <p className="text-xs text-surface-500 leading-relaxed">
                Roof-mounted overhead floodlights offering bright, shadow-balanced lighting for games until 9:00 PM.
              </p>
            </div>
          </div>

          {/* Card 3: Cricket Turf Nets & Pitch */}
          <div className="rounded-3xl border border-surface-200 bg-white overflow-hidden shadow-card hover:shadow-floating transition-all duration-300 group sm:col-span-2 lg:col-span-1">
            <div className="aspect-[4/3] w-full overflow-hidden relative bg-surface-900">
              <img
                src="/images/cricket-turf-pitch.webp"
                alt="Maya Sports Centre Indoor Cricket Turf Pitch"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface-900/90 text-emerald-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/20">
                Cricket Turf Pitch
              </span>
            </div>
            <div className="p-5 space-y-1">
              <h4 className="text-sm font-black text-surface-900">Indoor Cricket Practice Turf</h4>
              <p className="text-xs text-surface-500 leading-relaxed">
                Turf bowling crease with regulation stumps and high-safety netting for batting and bowling sessions.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. LOCATION & GOOGLE MAPS SECTION */}
      <section id="location" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-50 rounded-2xl border border-surface-200 p-6 sm:p-10 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Venue address and Get Directions button */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <Badge variant="brand" size="md">
                  Location & Directions
                </Badge>
                <h3 className="text-2xl font-bold tracking-tight text-surface-900 mt-2">
                  Visit Maya Sports Centre
                </h3>
                <p className="text-xs text-surface-500 mt-1">
                  Located in Hetauda, Bagmati Province. Easily accessible with direct Google Maps guidance.
                </p>
              </div>

              {/* Exact Address Box */}
              <div className="p-4 rounded-xl bg-white border border-surface-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase font-bold text-surface-500 block">
                      Full Physical Address
                    </span>
                    <span className="text-sm font-bold text-surface-900 block mt-0.5">
                      {BUSINESS_INFO.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Working Get Directions Button */}
              <div>
                <a
                  href={BUSINESS_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold"
                    rightIcon={<ExternalLink className="w-4 h-4" />}
                  >
                    Get Directions
                  </Button>
                </a>
                <span className="text-[11px] text-surface-500 text-center block mt-1.5">
                  Opens directly in Google Maps on mobile & desktop
                </span>
              </div>

              {/* Hours summary */}
              <div className="p-4 rounded-xl bg-white border border-surface-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-surface-900">
                  <Clock className="w-4 h-4 text-emerald-700" /> Operating Schedule
                </div>
                <div className="text-surface-600">
                  10:00 AM – 9:00 PM • Open 7 days a week
                </div>
              </div>
            </div>

            {/* Right: Interactive Google Map Embed preview */}
            <div className="lg:col-span-7 rounded-xl overflow-hidden border border-surface-200 bg-white shadow-subtle min-h-[320px] flex flex-col">
              <iframe
                title="Maya Sports Centre Google Map"
                src="https://maps.google.com/maps?q=C2FW%2B8VG%2C%20Rai%20Tole%20Marg%2C%20Hetauda%2C%20Bagmati%20Province%2044107&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-80"
              />
              <div className="p-3 bg-surface-50 border-t border-surface-200 flex items-center justify-between text-xs text-surface-600">
                <span>Rai Tole Marg, Hetauda 44107</span>
                <a
                  href={BUSINESS_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  View Full Map <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CONTACT US SECTION */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-surface-200 p-8 sm:p-12 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left: Direct Telephone Contact */}
            <div className="space-y-6">
              <Badge variant="brand" size="md">
                Contact Desk
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight text-surface-900">
                Call Our Staff Directly
              </h2>
              <p className="text-xs sm:text-sm text-surface-600 leading-relaxed">
                Have questions regarding recurring slots, match scheduling, or directions? Tap below to call our duty staff immediately.
              </p>

              {/* Clickable Phone Card */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider block mb-1">
                  Official Venue Phone
                </span>
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="text-2xl sm:text-3xl font-extrabold text-emerald-950 hover:text-emerald-700 transition-colors inline-flex items-center gap-2"
                >
                  <Phone className="w-6 h-6 text-emerald-700" />
                  <span>{BUSINESS_INFO.phone}</span>
                </a>
                <span className="text-[11px] text-emerald-800 block mt-1">
                  Click to dial directly from your mobile device
                </span>
              </div>
            </div>

            {/* Right: Quick Message Form */}
            <div className="bg-surface-50 rounded-xl border border-surface-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-surface-900">
                Send a Note to Management
              </h3>

              {inquirySubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Thank you! Your inquiry has been received.</span>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold uppercase text-surface-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suman Shrestha"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-surface-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="98XXXXXXXX"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-surface-600 mb-1">Message</label>
                    <textarea
                      rows={2}
                      placeholder="Question about bookings or timings"
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="md" className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold">
                    Submit Message
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-900 rounded-2xl p-8 sm:p-12 text-center text-white space-y-5 border border-surface-800">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Reserve Your Hour at Maya Sports Centre
          </h2>
          <p className="text-xs sm:text-sm text-surface-400 max-w-xl mx-auto leading-relaxed">
            Check live hourly availability from 10:00 AM to 9:00 PM. Reserve your slot now and pay on arrival at the counter.
          </p>
          <div>
            <Link to="/book">
              <Button
                size="lg"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Book Your Slot
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

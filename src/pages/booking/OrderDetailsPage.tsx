import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookingOrder } from '@/types';
import { useBooking } from '@/context/BookingContext';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { formatNPR, formatSlotTime } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Clock,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Calendar,
  MapPin,
  Banknote,
  Wallet,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Share2,
  Printer,
  Download,
} from 'lucide-react';

/* ─── LIVE PULSATING RADAR / WAITING ANIMATION ─── */
const LiveRadarWaitingAnimation: React.FC = () => {
  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center my-2 select-none">
      {/* Outer expanding ripple 1 */}
      <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping opacity-60" style={{ animationDuration: '3s' }} />

      {/* Outer expanding ripple 2 */}
      <div className="absolute inset-4 rounded-full border border-amber-500/40 animate-ping opacity-75 delay-300" style={{ animationDuration: '2.4s' }} />

      {/* Orbiting Radar Scanner */}
      <div className="absolute inset-2 rounded-full border border-amber-400/50 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
        <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b] -translate-y-[84px] sm:-translate-y-[98px]" />
      </div>

      {/* Central Glowing Orb */}
      <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-white shadow-xl flex flex-col items-center justify-center border-4 border-white">
        <PhoneCall className="w-8 h-8 sm:w-9 sm:h-9 animate-bounce text-white drop-shadow" style={{ animationDuration: '1.8s' }} />
        <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-white/95">
          Verifying
        </span>
      </div>
    </div>
  );
};

/* ─── CELEBRATORY CONFIRMATION ANIMATION ─── */
const ConfirmedCelebrationAnimation: React.FC = () => {
  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center my-2 select-none">
      {/* Emerald aura wave */}
      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/40 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute inset-4 rounded-full bg-emerald-500/10 animate-pulse" />

      {/* Central Verified Emblem */}
      <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-emerald-500 text-white shadow-2xl flex flex-col items-center justify-center border-4 border-white animate-bounce" style={{ animationDuration: '2.5s' }}>
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow" />
        <span className="text-[10px] font-black uppercase tracking-wider mt-0.5 text-white">
          Confirmed
        </span>
      </div>
    </div>
  );
};

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useBooking();
  const [order, setOrder] = useState<BookingOrder | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // ── Sync with live orders from BookingContext ──
  // Whenever BookingContext updates (via admin approval or Firestore snapshot),
  // automatically reflect it immediately so the pass updates in real-time.
  useEffect(() => {
    if (!orderId) return;

    // Check in-memory context first
    const contextMatch = orders.find((o) => o.id === orderId || o.bookingCode === orderId);
    if (contextMatch) {
      setOrder((prev) => {
        // If context match is confirmed, always prefer it!
        if (contextMatch.status === 'confirmed') return contextMatch;
        return prev?.status === 'confirmed' ? prev : contextMatch;
      });
      return;
    }

    // Fall back to localStorage
    try {
      const saved = localStorage.getItem('maya_local_booking_orders');
      if (saved) {
        const parsed: BookingOrder[] = JSON.parse(saved);
        const found = parsed.find((o) => o.id === orderId || o.bookingCode === orderId);
        if (found) {
          setOrder((prev) => (prev?.status === 'confirmed' ? prev : found));
        }
      }
    } catch {
      // ignore
    }
  }, [orderId, orders]);

  // ── Firestore real-time listener for direct document updates ──
  useEffect(() => {
    if (!orderId || !isFirebaseConfigured || !db) return;

    const orderRef = doc(db, 'bookings', orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (snap) => {
        if (snap.exists()) {
          const remoteData = { id: snap.id, ...(snap.data() as any) } as BookingOrder;
          setOrder((prev) => {
            // Keep confirmed state if already confirmed
            if (prev?.status === 'confirmed' && remoteData.status === 'pending') {
              return prev;
            }
            return remoteData;
          });
        }
      },
      (err) => {
        console.warn('Order listener:', err);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const handleCopyCode = () => {
    if (!order?.bookingCode) return;
    navigator.clipboard.writeText(order.bookingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadReceipt = () => {
    if (!order) return;
    const content = `===================================================
             MAYA SPORTS CENTRE
         Hetauda's No. 1 Sports Destination
   C2FW+8VG, Rai Tole Marg, Hetauda, Nepal
            Phone: +977 9714577877
===================================================

       OFFICIAL MATCH RESERVATION PASS
---------------------------------------------------
BOOKING CODE   : ${order.bookingCode || 'PENDING'}
STATUS         : ${order.status.toUpperCase()}
SPORT          : ${order.sport.toUpperCase()}
COURT          : ${order.courtName || 'Maya Turf Ground'}
DATE           : ${order.date}
TIME SLOT      : ${formatSlotTime(order.startTime, order.endTime)} (60 Mins)
TOTAL FEE      : ${formatNPR(order.totalAmount)}
PAYMENT METHOD : ${order.paymentMethod === 'pay_online' ? 'Online (eSewa / Khalti)' : 'Pay on Arrival at Counter'}
PAYMENT STATUS : ${order.paymentStatus === 'received' ? 'PAID / RECEIVED' : 'PAYABLE AT VENUE'}

PLAYER DETAILS
---------------------------------------------------
NAME           : ${order.customerName}
PHONE          : ${order.customerPhone}
EMAIL          : ${order.customerEmail || 'N/A'}
NOTE           : ${order.notes || 'None'}

ISSUED AT      : ${new Date(order.confirmedAt || order.createdAt).toLocaleString()}
---------------------------------------------------
* Please present this pass and Booking Code at the
  counter before entering the ground.
* Maya Sports Centre is open 7 days a week:
  10:00 AM – 9:00 PM.
===================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MayaSports_Pass_${order.bookingCode || order.id.slice(-6)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-surface-100 flex items-center justify-center">
          <Clock className="w-6 h-6 text-surface-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-surface-900">Loading Order Details...</h2>
        <p className="text-xs text-surface-500">Retrieving your match reservation slip from the server.</p>
        <Link to="/customer/bookings">
          <Button variant="outline" size="sm" className="mt-4">
            View All My Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';
  const isRejected = order.status === 'rejected';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">

      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between text-xs border-b border-surface-200 pb-4">
        <Link to="/customer/bookings" className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1">
          ← All My Bookings
        </Link>
        <button
          onClick={handleCopyShareLink}
          className="text-surface-500 hover:text-surface-800 font-medium flex items-center gap-1 bg-surface-100 px-3 py-1 rounded-lg transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share Pass'}</span>
        </button>
      </div>

      {/* HERO STATUS BANNER */}
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Dynamic State Animation */}
        {isPending && <LiveRadarWaitingAnimation />}
        {isConfirmed && <ConfirmedCelebrationAnimation />}
        {isRejected && (
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center my-3">
            <XCircle className="w-10 h-10" />
          </div>
        )}

        {/* Status Header */}
        <div className="space-y-1">
          {isPending && (
            <>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
                ● Awaiting Staff Verification
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-surface-900 tracking-tight mt-2">
                Booking Request Placed!
              </h1>
              <p className="text-xs sm:text-sm text-surface-600 max-w-md mx-auto leading-relaxed">
                Your court slot is held pending quick staff confirmation.
              </p>
            </>
          )}

          {isConfirmed && (
            <>
              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider">
                ✓ Officially Confirmed &amp; Locked
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-surface-900 tracking-tight mt-2">
                Match Slot Ready!
              </h1>
              <p className="text-xs sm:text-sm text-surface-600 max-w-md mx-auto leading-relaxed">
                Your court is officially booked. Present your Booking Code at the counter.
              </p>
            </>
          )}

          {isRejected && (
            <>
              <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-900 border border-red-300 text-xs font-black uppercase tracking-wider">
                ✕ Booking Declined
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight mt-2">
                Reservation Could Not Be Confirmed
              </h1>
              <p className="text-xs sm:text-sm text-red-700 max-w-md mx-auto leading-relaxed mt-1">
                {order.rejectionReason || 'The selected slot was unavailable or conflicted with venue schedule.'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 5-MINUTE CALL REMINDER BOX (FOR PENDING REQUESTS) */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-black text-amber-950 uppercase tracking-tight">
                Manager Call Expected Within 5 Minutes
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Our Maya Sports Centre venue manager will call your phone number{' '}
                <strong className="underline decoration-amber-400 font-black">{order.customerPhone}</strong>{' '}
                to verify your team and confirm ground availability. Please keep your phone reachable.
              </p>
              <div className="text-[11px] text-amber-800 font-bold flex items-center gap-2 pt-1">
                <span>Direct Venue Desk:</span>
                <a href={`tel:${BUSINESS_INFO.phone}`} className="underline font-black text-amber-950">
                  +977 {BUSINESS_INFO.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMED BOOKING CODE CARD (FOR CONFIRMED BOOKINGS) */}
      {isConfirmed && order.bookingCode && (
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border-2 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-black tracking-widest text-emerald-300">
              Official Match Pass
            </span>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white">
              Ready for Play
            </span>
          </div>

          <div className="text-center py-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
            <span className="text-[11px] uppercase tracking-wider text-emerald-200 block mb-1">
              Confirmed Booking Code
            </span>
            <div className="text-3xl sm:text-5xl font-mono font-black tracking-widest text-white drop-shadow">
              {order.bookingCode}
            </div>

            <button
              onClick={handleCopyCode}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-900 text-xs font-black shadow-md hover:bg-emerald-50 transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy Booking Code'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-emerald-100 bg-emerald-950/40 p-3 rounded-xl border border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Show this code or tell your mobile number when you arrive at Maya Sports Centre counter.</span>
          </div>
        </div>
      )}

      {/* COMPLETE ORDER DETAILS SUMMARY TICKET */}
      <div className="bg-white rounded-3xl border border-surface-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-surface-200 pb-4">
          <h3 className="text-base font-black text-surface-900 uppercase tracking-tight">
            Reservation Ticket Details
          </h3>
          <span className="text-xs font-mono font-bold text-surface-400">
            #{order.id.slice(-8)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Date */}
          <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 space-y-1">
            <span className="text-surface-500 font-bold flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Match Date
            </span>
            <span className="font-black text-surface-900 block text-sm sm:text-base">
              {order.date}
            </span>
            {order.isSaturday && (
              <span className="text-[11px] font-bold text-emerald-700">Saturday Rate Applied</span>
            )}
          </div>

          {/* Time Window */}
          <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 space-y-1">
            <span className="text-surface-500 font-bold flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-700" /> Playing Hour
            </span>
            <span className="font-black text-surface-900 block text-sm sm:text-base">
              {formatSlotTime(order.startTime, order.endTime)}
            </span>
            <span className="text-[11px] text-surface-500">60 Minutes Match Play</span>
          </div>

          {/* Venue & Pitch */}
          <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 space-y-1">
            <span className="text-surface-500 font-bold flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Court &amp; Ground
            </span>
            <span className="font-black text-surface-900 block">
              {BUSINESS_INFO.name} Ground
            </span>
            <span className="text-[11px] text-surface-500">Covered Artificial Turf with LED Lights</span>
          </div>

          {/* Payment Method */}
          <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 space-y-1">
            <span className="text-surface-500 font-bold flex items-center gap-1.5 text-xs">
              {order.paymentStatus === 'received' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              ) : order.paymentMethod === 'pay_online' ? (
                <QrCode className="w-3.5 h-3.5 text-purple-700" />
              ) : (
                <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              )}
              Payment Method
            </span>
            <span className="font-black text-surface-900 block">
              {order.paymentStatus === 'received'
                ? `Paid via ${(order.paymentMethod || 'Online').toUpperCase()}`
                : order.paymentMethod === 'pay_online'
                ? 'Online Payment (eSewa / Khalti / Fonepay)'
                : 'Pay on Arrival at Counter'}
            </span>
            <span className="text-[11px] font-semibold text-surface-600 block">
              {order.paymentStatus === 'received' ? (
                <span className="text-emerald-700 font-bold">
                  ✓ Paid &amp; Verified {order.transactionId ? `• Ref: ${order.transactionId}` : ''}
                </span>
              ) : (
                <span>Payment Pending (Payable at venue or online)</span>
              )}
            </span>
          </div>

          {/* Customer Name */}
          <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 space-y-1">
            <span className="text-surface-500 font-bold text-xs">Reserved For</span>
            <span className="font-black text-surface-900 block">{order.customerName}</span>
            <span className="text-[11px] text-surface-500">Contact: {order.customerPhone}</span>
          </div>

          {/* Total Fee */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-emerald-800 font-bold flex items-center gap-1.5 text-xs">
              <Banknote className="w-3.5 h-3.5 text-emerald-700" /> Total Court Fee
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900 block">
              {formatNPR(order.totalAmount)}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">Includes 1-hour ground access</span>
          </div>
        </div>

        {/* Customer Note if any */}
        {order.notes && (
          <div className="p-3 bg-surface-50 rounded-xl text-xs border border-surface-200">
            <span className="font-bold text-surface-600 block mb-0.5">Player Note:</span>
            <span className="text-surface-800">{order.notes}</span>
          </div>
        )}
      </div>

      {/* PERMANENT ACCESS NOTICE */}
      <div className="p-4 rounded-2xl bg-surface-100 border border-surface-200 text-xs text-surface-600 text-center space-y-1">
        <p className="font-bold text-surface-800">
          This order is permanently saved in your account history.
        </p>
        <p className="text-surface-500">
          You can return to Maya Sports Centre anytime, click "My Bookings" in the menu, and show your confirmation pass.
        </p>
      </div>

      {/* ACTION SUITE */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {order.paymentStatus !== 'received' && order.status !== 'rejected' && (
          <Link to={`/pay/${order.id}`} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg hover:from-emerald-700 hover:to-teal-800"
              leftIcon={<QrCode className="w-4 h-4" />}
            >
              Pay Online (eSewa / Khalti / Fonepay)
            </Button>
          </Link>
        )}

        <Link to="/customer/bookings" className="w-full sm:w-auto">
          <Button variant="outline" size="md" className="w-full sm:w-auto font-bold bg-white">
            View All My Bookings
          </Button>
        </Link>

        {isConfirmed && (
          <>
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto font-bold bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Print Ticket
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto font-bold bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadReceipt}
            >
              Download Pass
            </Button>
          </>
        )}

        <Link to="/book" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto font-black bg-emerald-700 hover:bg-emerald-800"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Book Another Slot
          </Button>
        </Link>
      </div>

    </div>
  );
};

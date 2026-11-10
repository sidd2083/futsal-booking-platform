import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { BookingOrder, PaymentMethod } from '@/types';
import { formatNPR, formatSlotTime } from '@/lib/utils';
import { PAYMENT_GATEWAY_CONFIG } from '@/lib/constants';
import { Button } from '@/components/common/Button';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  QrCode,
  Smartphone,
  Sparkles,
  RefreshCw,
  Check,
  Calendar,
  Clock,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PaymentCheckoutPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, markOrderPaymentReceived } = useBooking();

  const [order, setOrder] = useState<BookingOrder | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'esewa' | 'khalti' | 'fonepay'>('esewa');
  const [subMethod, setSubMethod] = useState<'wallet' | 'qr'>('wallet');

  // Input fields for simulation
  const [walletPhone, setWalletPhone] = useState('9841000000');
  const [walletPin, setWalletPin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnCode, setTxnCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync order from context or localStorage
  useEffect(() => {
    if (!orderId) return;

    const match = orders.find((o) => o.id === orderId || o.bookingCode === orderId);
    if (match) {
      setOrder(match);
      return;
    }

    // Direct Firestore listener fallback
    if (isFirebaseConfigured && db) {
      const unsub = onSnapshot(
        doc(db, 'bookings', orderId),
        (snap) => {
          if (snap.exists()) {
            setOrder({ id: snap.id, ...(snap.data() as any) } as BookingOrder);
          }
        },
        (err) => console.warn('Payment order listener notice:', err)
      );
      return () => unsub();
    }
  }, [orderId, orders]);

  // Adjust default inputs based on provider
  useEffect(() => {
    if (selectedProvider === 'esewa') {
      setWalletPhone(PAYMENT_GATEWAY_CONFIG.esewa.demoAccount);
      setWalletPin(PAYMENT_GATEWAY_CONFIG.esewa.demoMpin);
    } else if (selectedProvider === 'khalti') {
      setWalletPhone(PAYMENT_GATEWAY_CONFIG.khalti.demoAccount);
      setWalletPin(PAYMENT_GATEWAY_CONFIG.khalti.demoOtp);
    } else {
      setSubMethod('qr');
    }
  }, [selectedProvider]);

  // Handle Simulated Payment Submission
  const handleSimulatePayment = async () => {
    if (!order) return;
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // Step 1: Connecting
      setProcessingStep(`Connecting to ${PAYMENT_GATEWAY_CONFIG[selectedProvider].name} gateway...`);
      await new Promise((r) => setTimeout(r, 700));

      // Step 2: Authorizing
      setProcessingStep('Authorizing secure transaction with Nepal Clearing House (NCHL)...');
      await new Promise((r) => setTimeout(r, 800));

      // Step 3: Verifying & Updating
      setProcessingStep('Payment approved! Securing your match booking on court...');
      const generatedTxn = `TXN_${selectedProvider.toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;
      setTxnCode(generatedTxn);

      const result = await markOrderPaymentReceived(
        order.id,
        selectedProvider as PaymentMethod,
        generatedTxn
      );

      if (result.success) {
        setPaymentSuccess(true);
        // Play soft success chime via Web Audio API
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.5);
        } catch {
          // ignore
        }

        // Wait 1.8 seconds so the user enjoys the celebratory feedback
        setTimeout(() => {
          navigate(`/order/${order.id}`);
        }, 1800);
      } else {
        setErrorMsg(result.error || 'Payment recorded locally, but failed to sync to cloud.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-surface-100 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-surface-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-surface-900">Loading Order Details...</h2>
        <p className="text-xs text-surface-500">Retrieving checkout amount from Maya Sports Centre server.</p>
        <Link to="/customer/bookings">
          <Button variant="outline" size="sm" className="mt-4">
            Back to My Bookings
          </Button>
        </Link>
      </div>
    );
  }

  // If already paid
  if (order.paymentStatus === 'received') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-surface-900">Payment Already Completed!</h2>
        <p className="text-xs text-surface-600">
          This booking has already been verified and paid via{' '}
          <strong className="text-surface-900 uppercase">{order.paymentMethod}</strong>.
        </p>
        <div className="pt-2">
          <Link to={`/order/${order.id}`}>
            <Button variant="primary" size="md">
              View Confirmed Match Pass
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50/70 pb-20 pt-6 sm:pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Back Link & Security Badge */}
        <div className="flex items-center justify-between">
          <Link
            to={`/order/${order.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 hover:text-surface-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Order Pass</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-[11px] font-bold text-emerald-800">
            <Lock className="w-3 h-3 text-emerald-700" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* MERCHANT DEMO CREDENTIAL NOTICE */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-amber-950 uppercase tracking-tight">
                Demo Online Payment Gateway Active
              </span>
              <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Sandbox Mode
              </span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              This demo simulates official Nepal payment flows for <strong>eSewa</strong>, <strong>Khalti</strong>, and <strong>Fonepay</strong>.
              No real money is deducted. When your venue merchant account is approved, your live credentials will seamlessly activate real payments.
            </p>
          </div>
        </div>

        {/* MAIN CHECKOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: PAYMENT SELECTOR & INTERACTIVE GATEWAY (8 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-surface-200 shadow-card p-5 sm:p-7 space-y-6">

            <div>
              <h2 className="text-lg font-black text-surface-900 uppercase tracking-tight">
                Select Online Payment Option
              </h2>
              <p className="text-xs text-surface-500">
                Choose your preferred digital wallet or instant bank QR transfer.
              </p>
            </div>

            {/* PROVIDER TABS: eSewa, Khalti, Fonepay */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* eSewa Tab */}
              <button
                type="button"
                onClick={() => setSelectedProvider('esewa')}
                className={cn(
                  'relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 select-none',
                  selectedProvider === 'esewa'
                    ? 'border-[#60bb46] bg-[#60bb46]/10 shadow-sm ring-2 ring-[#60bb46]/20'
                    : 'border-surface-200 hover:border-surface-300 bg-white'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[#60bb46] text-white flex items-center justify-center font-black text-base shadow-sm mb-1.5">
                  e
                </div>
                <span className="text-xs font-black text-surface-900">eSewa</span>
                <span className="text-[10px] font-semibold text-[#60bb46]">Wallet / QR</span>
                {selectedProvider === 'esewa' && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#60bb46] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Khalti Tab */}
              <button
                type="button"
                onClick={() => setSelectedProvider('khalti')}
                className={cn(
                  'relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 select-none',
                  selectedProvider === 'khalti'
                    ? 'border-[#5c2d91] bg-[#5c2d91]/10 shadow-sm ring-2 ring-[#5c2d91]/20'
                    : 'border-surface-200 hover:border-surface-300 bg-white'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[#5c2d91] text-white flex items-center justify-center font-black text-base shadow-sm mb-1.5">
                  K
                </div>
                <span className="text-xs font-black text-surface-900">Khalti</span>
                <span className="text-[10px] font-semibold text-[#5c2d91]">Wallet / OTP</span>
                {selectedProvider === 'khalti' && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#5c2d91] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Fonepay Tab */}
              <button
                type="button"
                onClick={() => setSelectedProvider('fonepay')}
                className={cn(
                  'relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 select-none',
                  selectedProvider === 'fonepay'
                    ? 'border-[#d32f2f] bg-[#d32f2f]/10 shadow-sm ring-2 ring-[#d32f2f]/20'
                    : 'border-surface-200 hover:border-surface-300 bg-white'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[#d32f2f] text-white flex items-center justify-center font-black text-sm shadow-sm mb-1.5">
                  FP
                </div>
                <span className="text-xs font-black text-surface-900">Fonepay</span>
                <span className="text-[10px] font-semibold text-[#d32f2f]">Any Bank QR</span>
                {selectedProvider === 'fonepay' && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#d32f2f] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            </div>

            {/* SUB-METHOD (WALLET LOGIN VS SCAN QR) */}
            {selectedProvider !== 'fonepay' && (
              <div className="flex rounded-xl bg-surface-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSubMethod('wallet')}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5',
                    subMethod === 'wallet' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Wallet ID &amp; PIN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubMethod('qr')}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5',
                    subMethod === 'qr' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'
                  )}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Code</span>
                </button>
              </div>
            )}

            {/* GATEWAY INTERACTION BODY */}
            {subMethod === 'wallet' && selectedProvider !== 'fonepay' && (
              <div className="space-y-4 bg-surface-50 p-4 rounded-2xl border border-surface-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-surface-700">
                    {selectedProvider === 'esewa' ? 'eSewa ID (Mobile / Email)' : 'Khalti Registered Mobile'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedProvider === 'esewa') {
                        setWalletPhone('9841000000');
                        setWalletPin('1234');
                      } else {
                        setWalletPhone('9801000000');
                        setWalletPin('1111');
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Autofill Demo Account</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-surface-700">
                        {selectedProvider === 'esewa' ? 'eSewa MPIN / Password' : 'Khalti Confirmation MPIN'}
                      </span>
                    </div>
                    <input
                      type="password"
                      value={walletPin}
                      onChange={(e) => setWalletPin(e.target.value)}
                      placeholder="••••"
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-surface-500 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Demo simulation securely emulates official Nepal NCHL clearing flow.</span>
                </div>
              </div>
            )}

            {/* QR CODE VIEW (FOR FONEPAY OR QR SUBMETHOD) */}
            {(subMethod === 'qr' || selectedProvider === 'fonepay') && (
              <div className="flex flex-col items-center justify-center p-6 bg-surface-50 rounded-2xl border border-surface-200 text-center space-y-3">
                <div className="relative p-3 bg-white rounded-2xl border-2 border-surface-300 shadow-sm">
                  {/* Simulated QR Pattern */}
                  <div className="w-44 h-44 bg-surface-900 rounded-xl flex flex-col items-center justify-center p-2 text-white relative overflow-hidden">
                    <QrCode className="w-32 h-32 text-white opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent animate-pulse" />
                    <div className="absolute bottom-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                      {selectedProvider.toUpperCase()} PAY
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-black text-surface-900 block">
                    {selectedProvider === 'fonepay'
                      ? 'Scan with any Nepal Mobile Banking App'
                      : `Scan with your ${selectedProvider.toUpperCase()} App`}
                  </span>
                  <p className="text-[11px] text-surface-500 max-w-xs">
                    {selectedProvider === 'fonepay'
                      ? 'Supports NIC Asia, Global IME, Nabil, Prabhu, Siddhartha, and 50+ banks.'
                      : `Open ${selectedProvider} scanner and scan this merchant QR to pay.`}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                  <span>Merchant: Maya Sports Centre Futsal</span>
                </div>
              </div>
            )}

            {/* ERROR BANNER */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* PROCESSING OVERLAY / BUTTON */}
            {isProcessing ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-pulse">
                <div className="w-8 h-8 mx-auto border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
                    Processing Transaction
                  </span>
                  <p className="text-xs text-emerald-700 font-medium">{processingStep}</p>
                </div>
              </div>
            ) : paymentSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-600 text-white text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto animate-bounce" />
                <h4 className="text-base font-black uppercase">Payment Successful!</h4>
                <p className="text-xs text-emerald-100">
                  Transaction #{txnCode} confirmed. Redirecting to your official match pass...
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulatePayment}
                className={cn(
                  'w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2',
                  selectedProvider === 'esewa' && 'bg-[#60bb46] hover:bg-[#52a63b] shadow-[#60bb46]/25',
                  selectedProvider === 'khalti' && 'bg-[#5c2d91] hover:bg-[#4d257a] shadow-[#5c2d91]/25',
                  selectedProvider === 'fonepay' && 'bg-[#d32f2f] hover:bg-[#b71c1c] shadow-[#d32f2f]/25'
                )}
              >
                <Lock className="w-4 h-4" />
                <span>
                  Pay {formatNPR(order.totalAmount)} via {selectedProvider.toUpperCase()} (Demo Test)
                </span>
              </button>
            )}

            <div className="text-center">
              <span className="text-[11px] text-surface-400">
                🔒 Protected by Maya Sports Centre PCI-DSS Compliant Security
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER BREAKDOWN SUMMARY (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">

            {/* ORDER TICKET SUMMARY */}
            <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                <span className="text-xs font-black text-surface-900 uppercase tracking-wider">
                  Order Breakdown
                </span>
                <span className="text-xs font-mono font-bold text-surface-500">
                  #{order.id.slice(-8)}
                </span>
              </div>

              {/* Match Details */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between py-1 border-b border-surface-100">
                  <span className="text-surface-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-surface-400" /> Match Date
                  </span>
                  <span className="font-bold text-surface-900 text-right">
                    {order.date} {order.isSaturday && <span className="text-emerald-700">(Saturday)</span>}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-surface-100">
                  <span className="text-surface-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-surface-400" /> Time Window
                  </span>
                  <span className="font-bold text-surface-900 text-right">
                    {formatSlotTime(order.startTime, order.endTime)} (60 Mins)
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-surface-100">
                  <span className="text-surface-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-surface-400" /> Court
                  </span>
                  <span className="font-bold text-surface-900 text-right">
                    Maya Futsal Turf Ground
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-surface-100">
                  <span className="text-surface-500">Player Name</span>
                  <span className="font-bold text-surface-900 text-right">{order.customerName}</span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-surface-100">
                  <span className="text-surface-500">Player Phone</span>
                  <span className="font-mono font-bold text-surface-900 text-right">{order.customerPhone}</span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-surface-50 rounded-2xl p-3.5 space-y-2 text-xs border border-surface-200">
                <div className="flex items-center justify-between text-surface-600">
                  <span>Ground Court Fee (1 Hour)</span>
                  <span className="font-bold">{formatNPR(order.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-surface-600">
                  <span>Digital Gateway Fee</span>
                  <span className="font-bold text-emerald-700">FREE (NPR 0)</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-surface-900 pt-2 border-t border-surface-200">
                  <span>Total Amount Payable</span>
                  <span className="text-lg font-black text-emerald-800">
                    {formatNPR(order.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-surface-500 leading-snug">
                Upon payment confirmation, your court slot will be marked as paid and ready for immediate entry at the venue counter.
              </div>
            </div>

            {/* PREFER PAY ON ARRIVAL? */}
            <div className="bg-surface-100 rounded-2xl p-4 text-center space-y-2">
              <span className="text-xs font-bold text-surface-700 block">
                Prefer to pay in cash at the counter?
              </span>
              <p className="text-[11px] text-surface-500">
                You can also pay cash or scan the physical QR at Maya Sports Centre desk before kickoff.
              </p>
              <Link to={`/order/${order.id}`}>
                <Button variant="outline" size="sm" className="w-full font-bold bg-white mt-1">
                  Continue with Pay on Arrival
                </Button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

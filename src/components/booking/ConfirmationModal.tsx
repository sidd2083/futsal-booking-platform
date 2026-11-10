import React, { useState, useEffect } from 'react';
import { CourtSlot, BookingOrder, PaymentMethod } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatNPR, formatSlotTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import {
  Calendar,
  Clock,
  Banknote,
  AlertCircle,
  User,
  Wallet,
  QrCode,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
  slot: CourtSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: BookingOrder) => void;
  onRequestAuth: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  slot,
  isOpen,
  onClose,
  onSuccess,
  onRequestAuth,
}) => {
  const { user, updateProfile } = useAuth();
  const { requestSlotBooking } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState(user?.fullName || '');
  const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_on_arrival');

  useEffect(() => {
    if (user) {
      setNameInput(user.fullName || '');
      setPhoneInput(user.phoneNumber || '');
    }
  }, [user, isOpen]);

  if (!slot) return null;

  const handleConfirm = async () => {
    setErrorMessage(null);

    // If user is not authenticated, prompt the unified AuthModal
    if (!user) {
      onRequestAuth();
      return;
    }

    // Ensure valid name
    const cleanName = (nameInput || user.fullName || '').trim();
    if (cleanName.length < 2) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    // Ensure valid Nepal mobile number exists
    const cleanPhone = (phoneInput || user.phoneNumber || '').trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^(98|97|96)/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Nepali mobile number starting with 98 or 97.');
      return;
    }

    // Save profile if name or phone changed or was incomplete
    if (user.phoneNumber !== cleanPhone || user.fullName !== cleanName) {
      const res = await updateProfile({
        fullName: cleanName,
        phoneNumber: cleanPhone,
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to save contact profile.');
        return;
      }
    }

    setIsSubmitting(true);
    const result = await requestSlotBooking(slot, notes, paymentMethod);
    setIsSubmitting(false);

    if (result.success && result.order) {
      onSuccess(result.order);
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to place booking. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Slot Reservation"
      description={`Review your slot details for ${slot.date} at ${formatSlotTime(slot.startTime, slot.endTime)}.`}
    >
      <div className="space-y-4">
        {/* Order Summary Box */}
        <div className="bg-surface-50 rounded-2xl border border-surface-200 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs py-1 border-b border-surface-200">
            <span className="text-surface-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-surface-400" /> Date
            </span>
            <span className="font-bold text-surface-900">
              {slot.date} {slot.isSaturday && <span className="text-emerald-700 font-extrabold">(Saturday Rate)</span>}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-surface-200">
            <span className="text-surface-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-surface-400" /> Time Window
            </span>
            <span className="font-bold text-surface-900">
              {formatSlotTime(slot.startTime, slot.endTime)} (1 Hour Match)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-surface-500 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-surface-400" /> Total Fee
            </span>
            <span className="text-lg font-black text-emerald-800">
              {formatNPR(slot.price)}
            </span>
          </div>
        </div>

        {/* PAYMENT METHOD SELECTOR: TWO EXPLICIT OPTIONS */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-surface-800 uppercase tracking-wider">
            Choose Payment Option
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* OPTION 1: Pay on Arrival */}
            <button
              type="button"
              onClick={() => setPaymentMethod('pay_on_arrival')}
              className={cn(
                'relative flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all duration-200',
                paymentMethod === 'pay_on_arrival'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-surface-200 bg-white hover:border-surface-300'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="flex items-center gap-2 text-xs font-black text-surface-900">
                  <Wallet className={cn('w-4 h-4', paymentMethod === 'pay_on_arrival' ? 'text-emerald-700' : 'text-surface-500')} />
                  Pay on Arrival
                </span>
                {paymentMethod === 'pay_on_arrival' && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-surface-600 leading-snug">
                Pay in cash or venue QR code at Maya Sports Centre counter before match.
              </p>
              <span className="mt-1.5 text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100/60 px-2 py-0.5 rounded">
                Recommended • No Advance Needed
              </span>
            </button>

            {/* OPTION 2: Pay Online */}
            <button
              type="button"
              onClick={() => setPaymentMethod('pay_online')}
              className={cn(
                'relative flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all duration-200',
                paymentMethod === 'pay_online'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-surface-200 bg-white hover:border-surface-300'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="flex items-center gap-2 text-xs font-black text-surface-900">
                  <QrCode className={cn('w-4 h-4', paymentMethod === 'pay_online' ? 'text-emerald-700' : 'text-surface-500')} />
                  Pay Online
                </span>
                {paymentMethod === 'pay_online' && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-surface-600 leading-snug">
                eSewa, Khalti, or Mobile Banking transfer. QR provided after staff review.
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[9px] font-black text-white bg-green-600 px-1.5 py-0.5 rounded">eSewa</span>
                <span className="text-[9px] font-black text-white bg-purple-600 px-1.5 py-0.5 rounded">Khalti</span>
                <span className="text-[9px] font-black text-surface-700 bg-surface-200 px-1.5 py-0.5 rounded">Fonepay</span>
              </div>
            </button>
          </div>

          {paymentMethod === 'pay_online' && (
            <div className="p-2.5 bg-purple-50/80 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Staff will contact you via WhatsApp or phone with our official venue QR code once your request is reviewed.
              </p>
            </div>
          )}
        </div>

        {/* Player Identity: Both Name AND Phone */}
        {user ? (
          <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 space-y-3">
            <span className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
              Player Contact Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-surface-600 uppercase mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-surface-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Ramesh Thapa"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-surface-600 uppercase mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-surface-400 font-bold">+977</span>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-14 pr-3 py-2 rounded-xl border border-surface-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-surface-500">
              Staff calls this number to verify Pay on Arrival requests before your match.
            </p>
          </div>
        ) : (
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-3.5 text-center space-y-2">
            <p className="text-xs text-surface-600">
              Please sign in or register to confirm this reservation.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestAuth}
              className="w-full bg-white font-bold"
            >
              Sign In or Register
            </Button>
          </div>
        )}

        {/* Optional Player Note */}
        <div>
          <label className="block text-[11px] font-semibold uppercase text-surface-500 mb-1">
            Optional Note to Venue Staff
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. 5v5 friendly match, need ball"
            className="w-full px-3 py-2 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Notice */}
        <p className="text-[11px] text-surface-500 leading-relaxed">
          * Confirming will immediately hold this slot as <strong>pending review</strong>. Staff reviews requests and may phone your number to confirm.
        </p>

        {/* Action Buttons: Yes / No */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            className="bg-emerald-700 hover:bg-emerald-800 font-black px-6"
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
};

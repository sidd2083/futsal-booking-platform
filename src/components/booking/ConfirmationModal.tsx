import React, { useState } from 'react';
import { CourtSlot, BookingOrder } from '@/types';
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
  Phone,
} from 'lucide-react';

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

  const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '');
  const [notes, setNotes] = useState('');

  if (!slot) return null;

  const handleConfirm = async () => {
    setErrorMessage(null);

    // If user is not authenticated, prompt the unified AuthModal
    if (!user) {
      onRequestAuth();
      return;
    }

    // Ensure phone number exists
    if (!user.phoneNumber || user.phoneNumber.trim().length < 8) {
      if (!phoneInput || phoneInput.trim().length < 8) {
        setErrorMessage('Please provide a valid 10-digit mobile number so staff can confirm your request.');
        return;
      }
      const res = await updateProfile({
        fullName: user.fullName || 'Player',
        phoneNumber: phoneInput,
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to save contact number.');
        return;
      }
    }

    setIsSubmitting(true);
    const result = await requestSlotBooking(slot, notes);
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
      description={`Are you sure you want to book ${slot.date} at ${formatSlotTime(slot.startTime, slot.endTime)}?`}
    >
      <div className="space-y-5">
        {/* Order Summary Box */}
        <div className="bg-surface-50 rounded-xl border border-surface-200 p-4 space-y-3">
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
              {formatSlotTime(slot.startTime, slot.endTime)} (1 Hour)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-surface-200">
            <span className="text-surface-500 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-surface-400" /> Hourly Rate
            </span>
            <span className="text-base font-extrabold text-emerald-800">
              {formatNPR(slot.price)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-surface-500">Payment Method</span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Pay on Arrival
            </span>
          </div>
        </div>

        {/* User Identity / Phone Verification */}
        {user ? (
          (!user.phoneNumber || user.phoneNumber.trim().length < 8) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Phone className="w-4 h-4 text-amber-700" /> Phone Number Required
              </div>
              <p className="text-xs text-amber-800">
                Staff will call this number to verify and approve your slot.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-surface-400 font-bold">+977</span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-14 pr-3 py-2 rounded-lg border border-amber-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )
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
            placeholder="e.g. Friendly 5v5 match"
            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Notice */}
        <p className="text-[11px] text-surface-500 leading-relaxed">
          * Confirming will immediately hold this slot as <strong>pending review</strong>. Staff reviews requests and may phone your number to confirm.
        </p>

        {/* Action Buttons: Yes / No */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            No (Cancel)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            className="bg-emerald-700 hover:bg-emerald-800 font-bold"
          >
            Yes (Confirm Booking)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

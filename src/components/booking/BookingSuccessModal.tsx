import React from 'react';
import { BookingOrder } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatNPR, formatSlotTime } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Clock,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface BookingSuccessModalProps {
  order: BookingOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md text-center"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Animated indicator */}
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center animate-pulse">
          <Clock className="w-7 h-7" />
        </div>

        <div>
          <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 mb-2">
            Request Under Review
          </span>
          <h3 className="text-xl font-bold text-surface-900 tracking-tight">
            Booking Request Placed!
          </h3>
          <p className="text-xs text-surface-600 mt-1 max-w-xs mx-auto leading-relaxed">
            Your slot has been reserved. The venue manager must verify your request and may call you to confirm.
          </p>
        </div>

        {/* Verification guidance card */}
        <div className="w-full bg-surface-50 rounded-xl border border-surface-200 p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-surface-900 border-b border-surface-200 pb-2">
            <PhoneCall className="w-4 h-4 text-brand-700" />
            <span>Verification Process</span>
          </div>

          <div className="text-xs text-surface-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-surface-500">Reserved For:</span>
              <span className="font-semibold text-surface-800">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Contact Number:</span>
              <span className="font-semibold text-surface-800">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Date & Slot:</span>
              <span className="font-semibold text-surface-800">
                {order.date} ({formatSlotTime(order.startTime, order.endTime)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Amount Due:</span>
              <span className="font-bold text-brand-700">{formatNPR(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Payment:</span>
              <span className="font-semibold text-surface-800">
                {order.paymentMethod === 'pay_online' ? 'Online Transfer (eSewa / Khalti)' : 'Pay on Arrival at Counter'}
              </span>
            </div>
          </div>
        </div>

        {/* Informative alert */}
        <div className="w-full p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] text-left flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>
            Once verified by staff, your official <strong>Booking Code</strong> will activate on your status screen, and the slot will turn green.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full pt-2">
          <Button
            variant="outline"
            size="md"
            className="w-1/2"
            onClick={onClose}
          >
            Close
          </Button>

          <Link to="/customer/bookings" className="w-1/2" onClick={onClose}>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import { formatNPR, formatSlotTime, getNepalTodayFormatted, cn } from '@/lib/utils';
import { BookingOrder } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { AuthModal } from '@/components/common/AuthModal';
import { AnnouncementModal } from '@/components/common/AnnouncementModal';
import {
  Calendar,
  Clock,
  AlertCircle,
  Copy,
  Check,
  User,
  ArrowRight,
  Phone,
  Bell,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

export const CustomerBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { userOrders, deleteOrderFromHistory } = useBooking();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'waiting' | 'approved' | 'played'>('all');

  // Delete confirmation modal state
  const [deletingOrder, setDeletingOrder] = useState<BookingOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const nepalToday = useMemo(() => getNepalTodayFormatted(), []);

  const waitingOrders = useMemo(() => userOrders.filter((o) => o.status === 'pending'), [userOrders]);
  const approvedOrders = useMemo(
    () => userOrders.filter((o) => o.status === 'confirmed' && o.date >= nepalToday),
    [userOrders, nepalToday]
  );
  const playedOrders = useMemo(
    () => userOrders.filter((o) => o.date < nepalToday || o.status === 'expired' || (o.status === 'confirmed' && o.date < nepalToday)),
    [userOrders, nepalToday]
  );

  const displayedOrders = useMemo(() => {
    if (filterTab === 'waiting') return waitingOrders;
    if (filterTab === 'approved') return approvedOrders;
    if (filterTab === 'played') return playedOrders;
    return userOrders;
  }, [filterTab, userOrders, waitingOrders, approvedOrders, playedOrders]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 text-surface-600 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
          Sign In to View Your Bookings
        </h1>
        <p className="text-xs text-surface-600 leading-relaxed">
          Access your personal booking status, view confirmed unique codes, and track verification in real time.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold"
          onClick={() => setAuthModalOpen(true)}
        >
          Sign In / Register
        </Button>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Profile Header */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xl shadow-sm">
            {user.fullName ? user.fullName[0].toUpperCase() : 'M'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight">
              {user.fullName || 'Player'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 mt-1">
              <span>{user.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-surface-400" />
                {user.phoneNumber || 'No phone set'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            className="font-bold border-surface-300 text-surface-700 bg-white"
            onClick={() => setNoticeModalOpen(true)}
            leftIcon={<Bell className="w-4 h-4 text-emerald-700" />}
          >
            Venue Notices
          </Button>

          <Link to="/book">
            <Button variant="primary" size="md" className="bg-emerald-700 hover:bg-emerald-800 font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Book Another Slot
            </Button>
          </Link>
        </div>
      </div>

      <AnnouncementModal
        isOpen={noticeModalOpen}
        onClose={() => setNoticeModalOpen(false)}
      />

      {/* Bookings List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-surface-900 tracking-tight">
                My Orders &amp; Booking History
              </h2>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Latest 7 Active
              </span>
            </div>
            <span className="text-xs text-surface-500">
              Showing your latest 7 reservations. Older past match records are automatically cleared to keep your slips clean.
            </span>
          </div>

          {/* 4 Interactive Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-100 rounded-xl border border-surface-200 text-xs overflow-x-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap',
                filterTab === 'all' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              All ({userOrders.length})
            </button>
            <button
              onClick={() => setFilterTab('waiting')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5',
                filterTab === 'waiting' ? 'bg-white text-amber-900 shadow-sm' : 'text-surface-600 hover:text-amber-800'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Waiting ({waitingOrders.length})
            </button>
            <button
              onClick={() => setFilterTab('approved')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5',
                filterTab === 'approved' ? 'bg-white text-emerald-900 shadow-sm' : 'text-surface-600 hover:text-emerald-800'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Approved ({approvedOrders.length})
            </button>
            <button
              onClick={() => setFilterTab('played')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap',
                filterTab === 'played' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              Played Earlier ({playedOrders.length})
            </button>
          </div>
        </div>

        {displayedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center space-y-4">
            <Calendar className="w-10 h-10 text-surface-300 mx-auto" />
            <h3 className="text-base font-bold text-surface-900">No Reservations In This View</h3>
            <p className="text-xs text-surface-500 max-w-sm mx-auto">
              {filterTab === 'all'
                ? "You haven't requested any futsal slots yet. Browse available dates and reserve an hour."
                : `You currently have 0 orders in "${filterTab}". Switch tabs above or book a new slot.`}
            </p>
            <div className="pt-2">
              <Link to="/book">
                <Button variant="primary" size="md" className="bg-emerald-700 hover:bg-emerald-800 font-bold">
                  Browse Available Slots
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayedOrders.map((order: BookingOrder) => {
              const isConfirmed = order.status === 'confirmed';
              const isPending = order.status === 'pending';
              const isRejected = order.status === 'rejected';
              const isConfirmedFuture = isConfirmed && (!order.date || order.date >= nepalToday);
              const canDelete = !isConfirmedFuture;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-surface-200 p-6 shadow-subtle hover:border-surface-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center text-surface-700">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-surface-900 block">
                          {order.courtName}
                        </span>
                        <span className="text-[11px] text-surface-500">
                          Order ID: {order.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConfirmed && (
                        <Badge variant="success" size="md" dot>
                          Confirmed by Staff
                        </Badge>
                      )}
                      {isPending && (
                        <Badge variant="warning" size="md" dot>
                          Pending Staff Verification
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge variant="danger" size="md" dot>
                          Request Declined
                        </Badge>
                      )}
                      {order.status === 'cancelled' && (
                        <Badge variant="neutral" size="md">
                          Cancelled
                        </Badge>
                      )}
                      {order.status === 'expired' && (
                        <Badge variant="neutral" size="md">
                          Expired
                        </Badge>
                      )}

                      {/* Can delete rejected, expired, cancelled, played earlier or pending, but NOT active confirmed booked slots */}
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingOrder(order);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition-colors ml-1"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 ml-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Booked Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-surface-500 block mb-0.5">Match Date</span>
                      <span className="font-bold text-surface-900">{order.date}</span>
                    </div>

                    <div>
                      <span className="text-surface-500 block mb-0.5">Time Window</span>
                      <span className="font-bold text-surface-900">
                        {formatSlotTime(order.startTime, order.endTime)}
                      </span>
                    </div>

                    <div>
                      <span className="text-surface-500 block mb-0.5">Amount Due</span>
                      <span className="font-bold text-emerald-800">
                        {formatNPR(order.totalAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-surface-500 block mb-0.5">Payment</span>
                      <span className="font-semibold text-surface-700">
                        {order.paymentStatus === 'received' ? (
                          <span className="text-emerald-700 font-bold">✓ Paid ({(order.paymentMethod || 'Online').toUpperCase()})</span>
                        ) : order.paymentMethod === 'pay_online' ? (
                          <Link to={`/pay/${order.id}`} className="text-purple-700 hover:underline font-bold">
                            Pay Online Now →
                          </Link>
                        ) : (
                          'Pay on Arrival'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Booking Code Banner */}
                  {isConfirmed && order.bookingCode && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                          Official Booking Verification Code
                        </span>
                        <span className="text-2xl font-extrabold text-emerald-950 tracking-tight font-mono">
                          {order.bookingCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold"
                          onClick={() => handleCopyCode(order.bookingCode!)}
                          leftIcon={
                            copiedCode === order.bookingCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )
                          }
                        >
                          {copiedCode === order.bookingCode ? 'Copied' : 'Copy Code'}
                        </Button>
                        <Link to={`/order/${order.id}`}>
                          <Button size="sm" variant="primary" className="bg-emerald-700 hover:bg-emerald-800 font-bold">
                            Live Pass →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Pending explanation */}
                  {isPending && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                        <span>
                          Our venue staff will call your number (<strong>{order.customerPhone}</strong>) within 5 minutes to verify your match attendance.
                        </span>
                      </div>
                      <Link to={`/order/${order.id}`} className="shrink-0">
                        <Button size="sm" variant="outline" className="border-amber-400 text-amber-950 bg-white font-bold w-full sm:w-auto">
                          Live Status Radar →
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Rejected explanation */}
                  {isRejected && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-700 mt-0.5" />
                      <span>
                        Reason:{' '}
                        <strong>
                          {order.rejectionReason || 'Declined by venue manager (Court unavailable)'}
                        </strong>
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal with Safe Popup */}
      {deletingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingOrder(null)}
          title="Delete Order from History"
          description="Are you sure you want to remove this record from your match history? This action cannot be undone."
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-surface-200">
                <span className="text-surface-500">Order ID:</span>
                <span className="font-mono font-bold text-surface-900">{deletingOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Match Date:</span>
                <span className="font-bold text-surface-900">{deletingOrder.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Time Window:</span>
                <span className="font-bold text-surface-900">{formatSlotTime(deletingOrder.startTime, deletingOrder.endTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Status:</span>
                <span className="font-bold uppercase text-[11px] text-surface-900">{deletingOrder.status}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-surface-200">
                <span className="text-surface-500">Total Fee:</span>
                <span className="font-extrabold text-emerald-800">{formatNPR(deletingOrder.totalAmount)}</span>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setDeletingOrder(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="bg-red-600 hover:bg-red-700 font-black text-white"
                onClick={async () => {
                  setIsDeleting(true);
                  setDeleteError(null);
                  const res = await deleteOrderFromHistory(deletingOrder.id);
                  setIsDeleting(false);
                  if (res.success) {
                    setDeletingOrder(null);
                  } else {
                    setDeleteError(res.error || 'Failed to remove order from history.');
                  }
                }}
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Yes, Delete Record
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

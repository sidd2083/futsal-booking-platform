import React, { useState, useMemo } from 'react';
import { useBooking } from '@/context/BookingContext';
import { BookingOrder } from '@/types';
import { formatNPR, formatSlotTime } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import {
  Shield,
  CheckCircle2,
  PlusCircle,
  Search,
  Phone,
  Eye,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const {
    orders,
    pendingOrders,
    revenueMetrics,
    adminApproveBooking,
    adminRejectBooking,
    adminCreateManualBooking,
  } = useBooking();

  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'orders' | 'manual'>(
    'approvals'
  );

  // Search & filter state for All Orders table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<BookingOrder | null>(null);

  // Manual booking drawer/modal state
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('18:00');
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);
  const [manualErrorMsg, setManualErrorMsg] = useState<string | null>(null);

  // Approval queue action loading states
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerPhone.includes(searchTerm) ||
        (o.bookingCode && o.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' ? true : o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleApprove = async (orderId: string) => {
    setProcessingId(orderId);
    await adminApproveBooking(orderId);
    setProcessingId(null);
  };

  const handleReject = async (orderId: string) => {
    const reason = window.prompt('Enter rejection reason (e.g. "Court booked offline / Maintenance"):');
    if (reason === null) return;
    setProcessingId(orderId);
    await adminRejectBooking(orderId, reason);
    setProcessingId(null);
  };

  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualErrorMsg(null);
    setManualSuccessMsg(null);

    if (!manualCustomerName.trim() || !manualCustomerPhone.trim()) {
      setManualErrorMsg('Customer name and phone number are required.');
      return;
    }

    const [hour] = manualStartTime.split(':').map(Number);
    const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`;

    setManualSubmitting(true);
    const result = await adminCreateManualBooking({
      date: manualDate,
      startTime: manualStartTime,
      endTime: endStr,
      customerName: manualCustomerName.trim(),
      customerPhone: manualCustomerPhone.trim(),
      notes: manualNotes.trim() || undefined,
    });
    setManualSubmitting(false);

    if (result.success && result.order) {
      setManualSuccessMsg(
        `Manual reservation locked! Official Code: ${result.order.bookingCode}`
      );
      setManualCustomerName('');
      setManualCustomerPhone('');
      setManualNotes('');
    } else {
      setManualErrorMsg(result.error || 'Failed to reserve slot. It may already be occupied.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-100 text-brand-800">
              <Shield className="w-4 h-4 text-brand-700" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-800">
              Staff Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 mt-1">
            Arena Operations & Booking Management
          </h1>
          <p className="text-xs sm:text-sm text-surface-500">
            Real-time queue verification, offline counter reservations, and financial ledger.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-100 rounded-xl border border-surface-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'approvals'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Pending Approval
            {pendingOrders.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Overview & Revenue
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            All Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            + Offline Booking
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WAITING FOR APPROVAL (CRITICAL SECTION) */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-surface-900 tracking-tight">
                Pending Verification Queue ({pendingOrders.length})
              </h2>
              <p className="text-xs text-surface-500">
                Call the customer to verify, then approve or decline to release the slot.
              </p>
            </div>
            {pendingOrders.length > 0 && (
              <Badge variant="warning" size="md" dot>
                {pendingOrders.length} Awaiting Staff Action
              </Badge>
            )}
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-surface-900">
                Queue is Clear!
              </h3>
              <p className="text-xs text-surface-500 max-w-sm mx-auto">
                No customer requests are currently awaiting approval. All slots are synchronized.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-card space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-surface-900 block text-base">
                        {order.customerName}
                      </span>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" /> {order.customerPhone} (Click to Call)
                      </a>
                    </div>
                    <Badge variant="warning" size="sm">
                      Pending
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-50 p-3 rounded-xl border border-surface-200">
                    <div>
                      <span className="text-surface-500 block">Requested Date:</span>
                      <span className="font-bold text-surface-900">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-surface-500 block">Time Slot:</span>
                      <span className="font-bold text-surface-900">
                        {formatSlotTime(order.startTime, order.endTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-surface-500 block">Order Total:</span>
                      <span className="font-bold text-brand-700">{formatNPR(order.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-surface-500 block">Payment:</span>
                      <span className="font-semibold text-surface-700">Pay on Arrival</span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="text-xs text-surface-600 bg-surface-100 p-2.5 rounded-lg">
                      <span className="font-semibold text-surface-700">Customer Note:</span> {order.notes}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-1/2"
                      onClick={() => handleReject(order.id)}
                      disabled={processingId === order.id}
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Reject Slot
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-1/2"
                      onClick={() => handleApprove(order.id)}
                      isLoading={processingId === order.id}
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Approve & Issue Code
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OVERVIEW & REVENUE ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Revenue Breakdown (Strictly Confirmed Orders) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-surface-900 tracking-tight">
                  Realized Revenue Breakdown
                </h2>
                <p className="text-xs text-surface-500">
                  Calculated strictly from confirmed and completed bookings (excludes pending/rejected).
                </p>
              </div>
              <Badge variant="brand" size="md">
                Currency: NPR
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Today */}
              <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-subtle space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-surface-500">
                  Today's Revenue
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
                  {formatNPR(revenueMetrics.todayRevenue)}
                </div>
                <span className="text-[11px] text-surface-500 block">
                  Current calendar day
                </span>
              </div>

              {/* This Week */}
              <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-subtle space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-surface-500">
                  This Week
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 tracking-tight">
                  {formatNPR(revenueMetrics.weekRevenue)}
                </div>
                <span className="text-[11px] text-surface-500 block">
                  Monday to present
                </span>
              </div>

              {/* This Month */}
              <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-subtle space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-surface-500">
                  This Month
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
                  {formatNPR(revenueMetrics.monthRevenue)}
                </div>
                <span className="text-[11px] text-surface-500 block">
                  Current billing cycle
                </span>
              </div>

              {/* All Time */}
              <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-subtle space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-surface-500">
                  All-Time Revenue
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
                  {formatNPR(revenueMetrics.allTimeRevenue)}
                </div>
                <span className="text-[11px] text-surface-500 block">
                  Cumulative verified total
                </span>
              </div>
            </div>
          </div>

          {/* Operational Volume Metrics */}
          <div>
            <h3 className="text-base font-bold text-surface-900 mb-4">
              Booking Volume & Customers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                <span className="text-2xl font-extrabold text-surface-900 block">
                  {revenueMetrics.totalBookings}
                </span>
                <span className="text-xs text-surface-500 font-medium">Total Lifetime Orders</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                <span className="text-2xl font-extrabold text-emerald-700 block">
                  {revenueMetrics.confirmedCount}
                </span>
                <span className="text-xs text-surface-500 font-medium">Confirmed Matches</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                <span className="text-2xl font-extrabold text-amber-600 block">
                  {revenueMetrics.pendingCount}
                </span>
                <span className="text-xs text-surface-500 font-medium">Pending Requests</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                <span className="text-2xl font-extrabold text-surface-900 block">
                  {revenueMetrics.totalCustomers}
                </span>
                <span className="text-xs text-surface-500 font-medium">Registered Players</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ALL ORDERS TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-surface-900 tracking-tight">
              Order Ledger
            </h2>

            {/* Filter Suite */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search player, phone, code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-surface-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Booking Code</th>
                    <th className="py-3 px-4">Player Details</th>
                    <th className="py-3 px-4">Match Date & Slot</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-surface-500">
                        No orders match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-surface-900">
                          {o.bookingCode || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-surface-900">{o.customerName}</div>
                          <div className="text-[11px] text-surface-500">{o.customerPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-surface-800">{o.date}</div>
                          <div className="text-[11px] text-surface-500">
                            {formatSlotTime(o.startTime, o.endTime)}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-brand-700">
                          {formatNPR(o.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          {o.status === 'confirmed' && <Badge variant="success" size="sm">Confirmed</Badge>}
                          {o.status === 'pending' && <Badge variant="warning" size="sm">Pending</Badge>}
                          {o.status === 'rejected' && <Badge variant="danger" size="sm">Rejected</Badge>}
                        </td>
                        <td className="py-3 px-4 text-surface-600">
                          {o.isManualBooking ? 'Walk-in / Phone' : 'Online Portal'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(o)}
                            className="p-1.5 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-lg"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OFFLINE / MANUAL COUNTER BOOKINGS */}
      {/* ========================================================================= */}
      {activeTab === 'manual' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-surface-200 p-8 shadow-card space-y-6">
          <div>
            <Badge variant="brand" size="md">
              Counter / Phone Desk
            </Badge>
            <h2 className="text-xl font-bold text-surface-900 tracking-tight mt-2">
              Create Offline Reservation
            </h2>
            <p className="text-xs text-surface-500 mt-1">
              For walk-in customers or telephone inquiries. Instantly locks the court slot and generates an official code.
            </p>
          </div>

          {manualSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{manualSuccessMsg}</span>
            </div>
          )}

          {manualErrorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{manualErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualBookingSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase text-surface-600 mb-1">
                  Reservation Date
                </label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-surface-600 mb-1">
                  Start Time (Hourly)
                </label>
                <select
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {Array.from({ length: 16 }).map((_, i) => {
                    const hour = 6 + i;
                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                    const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
                    return (
                      <option key={timeStr} value={timeStr}>
                        {formatSlotTime(timeStr, endStr)}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase text-surface-600 mb-1">
                  Customer / Team Leader Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suman Shrestha"
                  value={manualCustomerName}
                  onChange={(e) => setManualCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-surface-600 mb-1">
                  Customer Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="98XXXXXXXX"
                  value={manualCustomerPhone}
                  onChange={(e) => setManualCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase text-surface-600 mb-1">
                Optional Staff Note
              </label>
              <input
                type="text"
                placeholder="e.g. Advance paid in cash at counter"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={manualSubmitting}
                className="w-full font-bold"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Confirm Offline Reservation
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={Boolean(selectedOrderDetails)}
        onClose={() => setSelectedOrderDetails(null)}
        title="Order Audit Details"
      >
        {selectedOrderDetails && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-surface-500">Order ID:</span>
                <span className="font-mono text-surface-800">{selectedOrderDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Official Code:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  {selectedOrderDetails.bookingCode || 'Not issued'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Customer:</span>
                <span className="font-bold text-surface-900">{selectedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Phone:</span>
                <span className="font-bold text-surface-900">{selectedOrderDetails.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Date:</span>
                <span className="font-bold text-surface-900">{selectedOrderDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Slot:</span>
                <span className="font-bold text-surface-900">
                  {formatSlotTime(selectedOrderDetails.startTime, selectedOrderDetails.endTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Amount:</span>
                <span className="font-extrabold text-brand-700">
                  {formatNPR(selectedOrderDetails.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Status:</span>
                <span className="font-bold uppercase tracking-wider">{selectedOrderDetails.status}</span>
              </div>
              {selectedOrderDetails.notes && (
                <div className="pt-2 border-t border-surface-200">
                  <span className="text-surface-500 block mb-1">Notes:</span>
                  <p className="text-surface-700 italic">{selectedOrderDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedOrderDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

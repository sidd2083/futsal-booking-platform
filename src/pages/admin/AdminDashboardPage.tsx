import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import { BookingOrder } from '@/types';
import { formatNPR, formatSlotTime, generateHourlySlotDefinitions, getNepalTodayFormatted } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Logo } from '@/components/common/Logo';
import { Link } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  PlusCircle,
  Search,
  Phone,
  Check,
  X,
  AlertCircle,
  Lock,
  Mail,
  LogOut,
  LayoutDashboard,
  Clock,
  Calendar,
  Banknote,
  Users,
  FileText,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Copy,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, loginWithEmailPassword, logout } = useAuth();
  const {
    orders,
    pendingOrders,
    revenueMetrics,
    slots,
    selectedDate,
    setSelectedDate,
    adminApproveBooking,
    adminRejectBooking,
    adminCreateManualBooking,
  } = useBooking();

  // Admin login screen state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Sidebar View
  const [activeView, setActiveView] = useState<
    'overview' | 'approvals' | 'courts' | 'manual' | 'orders' | 'revenue' | 'customers'
  >('approvals');

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [rejectingOrder, setRejectingOrder] = useState<BookingOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Custom date range revenue state
  const [customRangeStart, setCustomRangeStart] = useState(() => getNepalTodayFormatted());
  const [customRangeEnd, setCustomRangeEnd] = useState(() => getNepalTodayFormatted());

  // Manual booking form state (10 AM to 9 PM)
  const [manualDate, setManualDate] = useState(() => getNepalTodayFormatted());
  const [manualStartTime, setManualStartTime] = useState('10:00');
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);
  const [manualErrorMsg, setManualErrorMsg] = useState<string | null>(null);

  // Action processing ID
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Approve confirmation modal state
  const [approvingOrder, setApprovingOrder] = useState<BookingOrder | null>(null);

  // Hourly slots (10:00 AM to 9:00 PM)
  const availableSlotTimes = useMemo(() => {
    return generateHourlySlotDefinitions(10, 21);
  }, []);

  // Handle Admin Sign In
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const res = await loginWithEmailPassword(adminEmail, adminPassword);
    setLoginLoading(false);

    if (!res.success) {
      setLoginError(res.error || 'Invalid administrator credentials.');
    }
  };

  // Filtered orders for the ledger
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

  // Unique customer directory from bookings
  const customerDirectory = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number; spent: number; lastDate: string }>();
    orders.forEach((o) => {
      const phone = o.customerPhone.trim();
      if (!phone) return;
      const existing = map.get(phone);
      if (existing) {
        existing.count += 1;
        if (o.status === 'confirmed') existing.spent += o.totalAmount;
        if (o.date > existing.lastDate) existing.lastDate = o.date;
      } else {
        map.set(phone, {
          name: o.customerName,
          phone,
          count: 1,
          spent: o.status === 'confirmed' ? o.totalAmount : 0,
          lastDate: o.date,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [orders]);

  // Custom Date Range Revenue
  const customRangeRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'confirmed' && o.date >= customRangeStart && o.date <= customRangeEnd)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders, customRangeStart, customRangeEnd]);

  // Approve action — requires confirmation modal first
  const handleApproveClick = (order: BookingOrder) => {
    setApprovingOrder(order);
  };

  const handleApproveConfirm = async () => {
    if (!approvingOrder) return;
    setProcessingId(approvingOrder.id);
    await adminApproveBooking(approvingOrder.id);
    setProcessingId(null);
    setApprovingOrder(null);
  };

  // Reject action
  const handleRejectConfirm = async () => {
    if (!rejectingOrder) return;
    setProcessingId(rejectingOrder.id);
    await adminRejectBooking(rejectingOrder.id, rejectionReason);
    setProcessingId(null);
    setRejectingOrder(null);
    setRejectionReason('');
  };

  // Manual Walk-in creation
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualErrorMsg(null);
    setManualSuccessMsg(null);

    if (!manualCustomerName.trim() || !manualCustomerPhone.trim()) {
      setManualErrorMsg('Please provide player name and mobile number.');
      return;
    }

    const startH = parseInt(manualStartTime.split(':')[0], 10);
    const endTime = `${(startH + 1).toString().padStart(2, '0')}:00`;

    setManualSubmitting(true);
    const res = await adminCreateManualBooking({
      date: manualDate,
      startTime: manualStartTime,
      endTime,
      customerName: manualCustomerName.trim(),
      customerPhone: manualCustomerPhone.trim(),
      notes: manualNotes.trim() || undefined,
    });
    setManualSubmitting(false);

    if (res.success && res.order) {
      setManualSuccessMsg(`Offline booking confirmed! Booking Code: ${res.order.bookingCode}`);
      setManualCustomerName('');
      setManualCustomerPhone('');
      setManualNotes('');
    } else {
      setManualErrorMsg(res.error || 'Failed to create offline reservation.');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ─── LOGIN SCREEN FOR NON-ADMIN ───
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-surface-200 p-8 shadow-card space-y-6">
          <div className="text-center space-y-2">
            <Logo size="lg" className="justify-center mb-2" />
            <h1 className="text-2xl font-black text-surface-900 tracking-tight">
              Venue Staff Portal
            </h1>
            <p className="text-xs text-surface-500">
              Sign in with your administrator credentials to manage reservations, approvals, and court revenue.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-surface-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@mayasports.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-surface-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold"
              isLoading={loginLoading}
            >
              Sign In to Admin Workspace
            </Button>
          </form>

          {user && !isAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                Account Signed In as Customer:
              </p>
              <p className="text-[11px] leading-relaxed">
                You are currently signed in as <strong>{user.email}</strong>. This email has not yet been registered in the <code>/adminUsers</code> collection in Firestore.
              </p>
              <Button size="sm" variant="outline" className="w-full bg-white font-bold" onClick={logout}>
                Log Out &amp; Switch Account
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── GOD-LEVEL SIDEBAR + CONTENT WORKSPACE ───
  return (
    <div className="flex h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] bg-surface-50 overflow-hidden">

      {/* ─── LEFT SIDEBAR NAVIGATION ─── */}
      <aside className="w-64 sm:w-72 bg-surface-900 text-surface-300 border-r border-surface-800 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
        <div>
          {/* Admin Identity Card */}
          <div className="p-5 border-b border-surface-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-black text-white block truncate uppercase tracking-tight">
                  {user.fullName || 'Venue Admin'}
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Staff Session Active
                </span>
              </div>
            </div>
          </div>

          {/* Core Navigation Items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveView('overview')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeView === 'overview'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
              )}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </span>
            </button>

            <button
              onClick={() => setActiveView('approvals')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeView === 'approvals'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Pending Queue</span>
              </span>
              {pendingOrders.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-amber-950 animate-pulse">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('courts')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeView === 'courts'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Court Schedule Master</span>
              </span>
            </button>

            <button
              onClick={() => setActiveView('manual')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeView === 'manual'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
              )}
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>Walk-in / Offline Desk</span>
              </span>
            </button>

            <button
              onClick={() => setActiveView('orders')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeView === 'orders'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
              )}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>All Bookings Ledger</span>
              </span>
              <span className="text-[11px] font-mono opacity-60">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('revenue')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeView === 'revenue'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Revenue &amp; Finance</span>
              </span>
            </button>

            <button
              onClick={() => setActiveView('customers')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeView === 'customers'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Players Directory</span>
              </span>
              <span className="text-[11px] font-mono opacity-60">
                {customerDirectory.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-surface-800/80 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* ─── RIGHT CONTENT WORKSPACE ─── */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto h-full">

        {/* 1. OVERVIEW & METRICS */}
        {activeView === 'overview' && (
          <div className="space-y-8 max-w-6xl">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight">
                Venue Performance &amp; Live Operations
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Real-time operational summary for Maya Sports Centre (Hetauda).
              </p>
            </div>

            {/* Financial Stats 4-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-surface-500 font-bold">
                  <span>Today's Earnings</span>
                  <Banknote className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {formatNPR(revenueMetrics.todayRevenue)}
                </div>
                <span className="text-[11px] text-surface-400">Locked match fees today</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-surface-500 font-bold">
                  <span>7-Day Rolling Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-black text-surface-900">
                  {formatNPR(revenueMetrics.weekRevenue)}
                </div>
                <span className="text-[11px] text-surface-400">Confirmed week turnover</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-surface-500 font-bold">
                  <span>Monthly Turnover</span>
                  <Calendar className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-black text-surface-900">
                  {formatNPR(revenueMetrics.monthRevenue)}
                </div>
                <span className="text-[11px] text-surface-400">Current month total</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-surface-500 font-bold">
                  <span>All-Time Realized</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-surface-900">
                  {formatNPR(revenueMetrics.allTimeRevenue)}
                </div>
                <span className="text-[11px] text-surface-400">Cumulative revenue</span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveView('approvals')}
                className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 hover:border-amber-300 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Pending Queue
                  </span>
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                    {pendingOrders.length}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-2">
                  Review customer slot requests awaiting phone call and verification.
                </p>
              </button>

              <button
                onClick={() => setActiveView('manual')}
                className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 hover:border-emerald-300 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    Offline Booking
                  </span>
                  <PlusCircle className="w-5 h-5 text-emerald-700" />
                </div>
                <p className="text-xs text-emerald-800 mt-2">
                  Issue an instant confirmed slot and unique booking code for counter walk-ins.
                </p>
              </button>

              <button
                onClick={() => setActiveView('courts')}
                className="p-5 rounded-2xl bg-surface-100 border border-surface-200 hover:border-surface-300 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-surface-900">
                    Today's Court Sheet
                  </span>
                  <Calendar className="w-5 h-5 text-surface-700" />
                </div>
                <p className="text-xs text-surface-600 mt-2">
                  View all 11 hourly slots for today and inspect who is playing on court.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* 2. PENDING APPROVALS QUEUE */}
        {activeView === 'approvals' && (
          <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                  <span>Pending Approval Queue</span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {pendingOrders.length} Requests
                  </span>
                </h2>
                <p className="text-xs text-surface-500 mt-1">
                  Call the customer to verify match attendance, then click "Approve &amp; Lock Slot".
                </p>
              </div>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-surface-200 p-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-surface-900">Queue is Clear!</h3>
                <p className="text-xs text-surface-500 max-w-sm mx-auto">
                  There are no pending slot requests right now. New online reservations will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-100 pb-4">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Awaiting Verification Call
                        </span>
                        <h4 className="text-base font-black text-surface-900 mt-1">
                          {order.customerName}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-surface-500 mt-0.5">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {order.customerPhone}
                          </a>
                          <span>•</span>
                          <span>Requested at {new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-surface-400 block">Fee Due</span>
                        <span className="text-lg font-black text-emerald-800">
                          {formatNPR(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Slot Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-50 p-3.5 rounded-2xl">
                      <div>
                        <span className="text-surface-400 block text-[11px]">Date</span>
                        <span className="font-bold text-surface-900">{order.date}</span>
                      </div>
                      <div>
                        <span className="text-surface-400 block text-[11px]">Time Window</span>
                        <span className="font-bold text-surface-900">{formatSlotTime(order.startTime, order.endTime)}</span>
                      </div>
                      <div>
                        <span className="text-surface-400 block text-[11px]">Payment</span>
                        <span className="font-bold text-surface-900">
                          {order.paymentMethod === 'pay_online' ? 'Online (eSewa/Khalti)' : 'Pay on Arrival'}
                        </span>
                      </div>
                      <div>
                        <span className="text-surface-400 block text-[11px]">Notes</span>
                        <span className="font-medium text-surface-700">{order.notes || 'None'}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                      <a href={`tel:${order.customerPhone}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold border-emerald-300 text-emerald-800 bg-white"
                          leftIcon={<Phone className="w-3.5 h-3.5" />}
                        >
                          Call Player
                        </Button>
                      </a>

                      <Button
                        variant="outline"
                        size="sm"
                        className="font-bold border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => setRejectingOrder(order)}
                        disabled={processingId === order.id}
                        leftIcon={<X className="w-3.5 h-3.5" />}
                      >
                        Decline
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        className="font-black bg-emerald-700 hover:bg-emerald-800 shadow-sm"
                        onClick={() => handleApproveClick(order)}
                        isLoading={processingId === order.id}
                        leftIcon={<Check className="w-4 h-4" />}
                      >
                        Approve &amp; Lock Slot
                      </Button>                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. COURT MASTER CONTROL */}
        {activeView === 'courts' && (
          <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-surface-900 tracking-tight">
                  Court Schedule Master
                </h2>
                <p className="text-xs text-surface-500 mt-1">
                  11 hourly slots for {selectedDate}. Inspect live locks and player bookings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-surface-600">Select Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-surface-200 text-xs font-bold bg-white"
                />
              </div>
            </div>

            {/* 11 Slots Master Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {slots.map((slot) => {
                const isConfirmed = slot.status === 'confirmed';
                const isPending = slot.status === 'pending';
                const isAvailable = slot.status === 'available';

                return (
                  <div
                    key={slot.slotId}
                    className={cn(
                      'p-4 rounded-2xl border-2 flex flex-col justify-between min-h-[110px] transition-all',
                      isConfirmed && 'bg-emerald-50 border-emerald-500 text-emerald-950',
                      isPending && 'bg-amber-50 border-amber-400 text-amber-950',
                      isAvailable && 'bg-white border-surface-200 text-surface-900'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">
                        {formatSlotTime(slot.startTime, slot.endTime)}
                      </span>
                      {isConfirmed && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-600 text-white">
                          {slot.bookingCode || 'Locked'}
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-amber-950">
                          Pending
                        </span>
                      )}
                      {isAvailable && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-100 text-surface-600">
                          Open
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-current/15 text-xs">
                      {slot.customerName ? (
                        <div>
                          <span className="font-bold block truncate">{slot.customerName}</span>
                          <span className="text-[11px] opacity-75">{slot.customerPhone}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-surface-500">
                          <span>Available</span>
                          <span className="font-extrabold text-emerald-800">{formatNPR(slot.price)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. WALK-IN / OFFLINE DESK */}
        {activeView === 'manual' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-surface-200 p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-emerald-700" />
                <span>Walk-in / Offline Counter Desk</span>
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Instantly book and lock a court slot for counter arrivals or phone bookings.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-bold bg-surface-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                    Playing Hour (1 Hour Slot)
                  </label>
                  <select
                    value={manualStartTime}
                    onChange={(e) => setManualStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-bold bg-surface-50"
                  >
                    {availableSlotTimes.map((t) => (
                      <option key={t.startTime} value={t.startTime}>
                        {formatSlotTime(t.startTime, t.endTime)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                    Player / Team Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Thapa"
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={manualCustomerPhone}
                    onChange={(e) => setManualCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                  Desk Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cash collected at counter"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-medium"
                />
              </div>

              {manualSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{manualSuccessMsg}</span>
                </div>
              )}

              {manualErrorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{manualErrorMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-emerald-700 hover:bg-emerald-800 font-black"
                isLoading={manualSubmitting}
              >
                Confirm &amp; Issue Match Code
              </Button>
            </form>
          </div>
        )}

        {/* 5. ALL BOOKINGS LEDGER */}
        {activeView === 'orders' && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-surface-900 tracking-tight">
                  All Bookings Ledger
                </h2>
                <p className="text-xs text-surface-500 mt-1">
                  Historical and upcoming court reservation records ({orders.length} total).
                </p>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-surface-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search player, phone, code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-xl border border-surface-200 text-xs font-medium bg-white w-48 sm:w-60"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-surface-200 text-xs font-bold bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Declined</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 font-bold text-surface-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Player &amp; Contact</th>
                      <th className="py-3 px-4">Booking Code</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-surface-400">
                          No booking records match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-surface-900 block">{order.date}</span>
                            <span className="text-[11px] text-surface-500">{formatSlotTime(order.startTime, order.endTime)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-surface-900 block">{order.customerName}</span>
                            <span className="text-[11px] text-surface-500 font-mono">{order.customerPhone}</span>
                          </td>
                          <td className="py-3 px-4">
                            {order.bookingCode ? (
                              <button
                                onClick={() => handleCopy(order.bookingCode!)}
                                className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100"
                              >
                                {copiedCode === order.bookingCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {order.bookingCode}
                              </button>
                            ) : (
                              <span className="text-surface-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {order.status === 'confirmed' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                                Confirmed
                              </span>
                            )}
                            {order.status === 'pending' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                                Pending Review
                              </span>
                            )}
                            {order.status === 'rejected' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-900">
                                Declined
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-surface-900">
                            {formatNPR(order.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link to={`/order/${order.id}`} target="_blank">
                              <Button size="sm" variant="outline" className="text-[11px] py-1 px-2.5">
                                View Pass ↗
                              </Button>
                            </Link>
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

        {/* 6. REVENUE & FINANCIAL AUDIT */}
        {activeView === 'revenue' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight">
                Revenue &amp; Financial Audits
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Track counter takings and custom date range performance.
              </p>
            </div>

            {/* Custom Calculator Box */}
            <div className="bg-white rounded-3xl border border-surface-200 p-6 shadow-subtle space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-surface-700">
                Custom Date Range Calculator
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-surface-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customRangeStart}
                    onChange={(e) => setCustomRangeStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-surface-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customRangeEnd}
                    onChange={(e) => setCustomRangeEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 text-xs font-bold"
                  />
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Period Total</span>
                  <span className="text-xl font-black text-emerald-900">{formatNPR(customRangeRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. PLAYERS DIRECTORY */}
        {activeView === 'customers' && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight">
                Players Directory
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Unique players and teams who have reserved court slots ({customerDirectory.length} total).
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 font-bold text-surface-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Player Name</th>
                      <th className="py-3 px-4">Mobile Number</th>
                      <th className="py-3 px-4">Total Reservations</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4">Last Match Date</th>
                      <th className="py-3 px-4 text-right">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {customerDirectory.map((c) => (
                      <tr key={c.phone} className="hover:bg-surface-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-surface-900">{c.name}</td>
                        <td className="py-3 px-4 font-mono">{c.phone}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-surface-100 font-bold">
                            {c.count} Matches
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-800">
                          {formatNPR(c.spent)}
                        </td>
                        <td className="py-3 px-4 text-surface-500">{c.lastDate}</td>
                        <td className="py-3 px-4 text-right">
                          <a href={`tel:${c.phone}`}>
                            <Button size="sm" variant="outline" className="text-[11px] py-1 px-2.5">
                              Call
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Reject Modal */}
      {rejectingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingOrder(null)}
          title="Decline Booking Request"
          description={`Decline ${rejectingOrder.customerName}'s request for ${rejectingOrder.date} at ${formatSlotTime(rejectingOrder.startTime, rejectingOrder.endTime)}?`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                Reason for Player
              </label>
              <input
                type="text"
                placeholder="e.g. Ground maintenance / double reservation"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-surface-200 text-xs"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setRejectingOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={handleRejectConfirm}
                isLoading={processingId === rejectingOrder.id}
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Approve Confirmation Modal */}
      {approvingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setApprovingOrder(null)}
          title="Confirm Booking Approval"
          description={`Approve ${approvingOrder.customerName}'s booking for ${approvingOrder.date} at ${formatSlotTime(approvingOrder.startTime, approvingOrder.endTime)}? This will lock the slot and generate a booking code.`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
              <p><span className="font-bold">Player:</span> {approvingOrder.customerName}</p>
              <p><span className="font-bold">Phone:</span> {approvingOrder.customerPhone}</p>
              <p><span className="font-bold">Date:</span> {approvingOrder.date}</p>
              <p><span className="font-bold">Time:</span> {formatSlotTime(approvingOrder.startTime, approvingOrder.endTime)}</p>
              <p><span className="font-bold">Amount:</span> {formatNPR(approvingOrder.totalAmount)}</p>
              <p><span className="font-bold">Payment:</span> {approvingOrder.paymentMethod === 'pay_online' ? 'Pay Online' : 'Pay on Arrival'}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setApprovingOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 font-black"
                onClick={handleApproveConfirm}
                isLoading={processingId === approvingOrder.id}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Yes, Confirm Booking
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

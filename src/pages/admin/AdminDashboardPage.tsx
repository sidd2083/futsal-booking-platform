import React, { useState, useMemo, useEffect } from 'react';
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
  Trash2,
  Megaphone,
  Coins,
  Ban,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const AdminDashboardInner: React.FC = () => {
  const { user, isAdmin, loginWithEmailPassword, logout, recheckAdmin } = useAuth();
  const {
    orders,
    pendingOrders,
    revenueMetrics,
    slots,
    selectedDate,
    setSelectedDate,
    adminApproveBooking,
    adminRejectBooking,
    adminCancelBooking,
    adminCreateManualBooking,
    pricing,
    updatePricing,
    closures,
    addClosure,
    removeClosure,
    announcement,
    updateAnnouncement,
    refreshBookings,
  } = useBooking();

  // Admin login screen state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [recheckingAdmin, setRecheckingAdmin] = useState(false);
  const [recheckNotice, setRecheckNotice] = useState<string | null>(null);

  // Real-Time Incoming Order Audio & Visual Alert State
  const [newOrderAlert, setNewOrderAlert] = useState<BookingOrder | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const prevPendingLength = React.useRef(pendingOrders.length);
  const isFirstMount = React.useRef(true);

  // Sound chime & visual notification when a new pending request arrives
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPendingLength.current = pendingOrders.length;
      return;
    }

    if (pendingOrders.length > prevPendingLength.current) {
      const newest = pendingOrders[0];
      setNewOrderAlert(newest);

      // Play soft dual-tone notification chime via Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch {
        // audio policy fallback
      }
    }
    prevPendingLength.current = pendingOrders.length;
  }, [pendingOrders]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refreshBookings();
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Active Sidebar View
  const [activeView, setActiveView] = useState<
    'overview' | 'approvals' | 'courts' | 'manual' | 'orders' | 'revenue' | 'customers' | 'pricing' | 'closures' | 'announcements'
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

  // Cancel / Release slot confirmation modal state
  const [cancelingTarget, setCancelingTarget] = useState<{
    id: string;
    slotId?: string;
    name: string;
    date: string;
    time: string;
    code?: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // ─── PRICING MANAGER STATE ───
  const [pricingNormalRate, setPricingNormalRate] = useState(() => pricing.normalDayRate);
  const [pricingSatRate, setPricingSatRate] = useState(() => pricing.saturdayRate);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState('');

  // ─── COURT CLOSURES STATE ───
  const [closureDate, setClosureDate] = useState(() => getNepalTodayFormatted());
  const [closureStartTime, setClosureStartTime] = useState('10:00');
  const [closureEndTime, setClosureEndTime] = useState('21:00');
  const [closureReason, setClosureReason] = useState('');
  const [closureSaving, setClosureSaving] = useState(false);
  const [closureSuccessMsg, setClosureSuccessMsg] = useState('');

  // ─── ANNOUNCEMENTS STATE ───
  const [annTitle, setAnnTitle] = useState(() => announcement?.title || '');
  const [annMessage, setAnnMessage] = useState(() => announcement?.message || '');
  const [annActive, setAnnActive] = useState(() => announcement?.active ?? false);
  const [annSaving, setAnnSaving] = useState(false);
  const [annSuccessMsg, setAnnSuccessMsg] = useState('');

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

    if (!res.success) {
      setLoginLoading(false);
      setLoginError(res.error || 'Invalid administrator credentials.');
      return;
    }

    // Immediately verify admin role across all Firebase collections
    const isNowAdmin = await recheckAdmin();
    setLoginLoading(false);
    if (!isNowAdmin) {
      setLoginError(`Signed in as ${adminEmail}, but this account is not registered as an administrator in Firestore yet.`);
    }
  };

  // Filtered orders for the ledger
  const filteredOrders = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    return (orders || []).filter((o) => {
      if (!o) return false;
      const cName = (o.customerName || '').toLowerCase();
      const cPhone = o.customerPhone || '';
      const bCode = (o.bookingCode || '').toLowerCase();
      const bId = (o.id || '').toLowerCase();

      const matchSearch =
        !q ||
        cName.includes(q) ||
        cPhone.includes(searchTerm) ||
        bCode.includes(q) ||
        bId.includes(q);

      const matchStatus = statusFilter === 'all' ? true : o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Unique customer directory from bookings
  const customerDirectory = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number; spent: number; lastDate: string }>();
    (orders || []).forEach((o) => {
      if (!o) return;
      const phone = (o.customerPhone || '').trim();
      if (!phone) return;
      const existing = map.get(phone);
      if (existing) {
        existing.count += 1;
        if (o.status === 'confirmed') existing.spent += (o.totalAmount || 0);
        if (o.date && (!existing.lastDate || o.date > existing.lastDate)) existing.lastDate = o.date;
      } else {
        map.set(phone, {
          name: o.customerName || 'Customer',
          phone,
          count: 1,
          spent: o.status === 'confirmed' ? (o.totalAmount || 0) : 0,
          lastDate: o.date || '',
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [orders]);

  // Custom Date Range Revenue
  const customRangeRevenue = useMemo(() => {
    return (orders || [])
      .filter((o) => o?.status === 'confirmed' && o?.date && o.date >= customRangeStart && o.date <= customRangeEnd)
      .reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  }, [orders, customRangeStart, customRangeEnd]);

  // Daily Revenue Breakdown
  const dailyRevenueBreakdown = useMemo(() => {
    const map = new Map<string, { date: string; total: number; count: number }>();
    (orders || []).forEach((o) => {
      if (o?.status === 'confirmed' && o?.date) {
        const existing = map.get(o.date);
        if (existing) {
          existing.total += o.totalAmount || 0;
          existing.count += 1;
        } else {
          map.set(o.date, { date: o.date, total: o.totalAmount || 0, count: 1 });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  }, [orders]);

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

  // Cancel / Release slot action
  const handleCancelClick = (target: {
    id: string;
    slotId?: string;
    name: string;
    date: string;
    time: string;
    code?: string;
  }) => {
    setCancelingTarget(target);
    setCancelReason('');
  };

  const handleCancelConfirm = async () => {
    if (!cancelingTarget) return;
    setProcessingId(cancelingTarget.id);
    await adminCancelBooking(cancelingTarget.id, cancelReason);
    setProcessingId(null);
    setCancelingTarget(null);
    setCancelReason('');
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

  // ─── PRICING SUBMIT ───
  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPricingSaving(true);
    setPricingSuccessMsg('');
    const res = await updatePricing({ normalDayRate: pricingNormalRate, saturdayRate: pricingSatRate });
    setPricingSaving(false);
    if (res.success) setPricingSuccessMsg('Pricing updated successfully!');
  };

  // ─── CLOSURE SUBMIT ───
  const handleClosureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureReason.trim()) return;
    setClosureSaving(true);
    setClosureSuccessMsg('');
    const res = await addClosure({
      date: closureDate,
      startTime: closureStartTime,
      endTime: closureEndTime,
      reason: closureReason.trim(),
    });
    setClosureSaving(false);
    if (res.success) {
      setClosureSuccessMsg('Court closure added!');
      setClosureReason('');
    }
  };

  // ─── ANNOUNCEMENT SUBMIT ───
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnSaving(true);
    setAnnSuccessMsg('');
    const res = await updateAnnouncement({ title: annTitle, message: annMessage, active: annActive });
    setAnnSaving(false);
    if (res.success) setAnnSuccessMsg('Announcement saved!');
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
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Account Signed In as Customer:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                You are currently signed in as <strong>{user.email}</strong>.
              </p>
              <p className="text-[11px] text-amber-800">
                Your Account UID: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono font-bold text-[10px] select-all">{user.uid}</code>
              </p>
              <p className="text-[11px] text-amber-800 leading-snug">
                If you set this email or UID in Firestore (under collection <code>adminUsers</code>, <code>admins</code>, or set <code>role: "admin"</code> in <code>users</code>), click below to verify:
              </p>

              {recheckNotice && (
                <div className="p-2.5 bg-white border border-amber-300 rounded-xl text-amber-900 text-[11px] font-bold">
                  {recheckNotice}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-emerald-700 hover:bg-emerald-800 font-black flex-1"
                  onClick={async () => {
                    setRecheckingAdmin(true);
                    setRecheckNotice(null);
                    const found = await recheckAdmin();
                    setRecheckingAdmin(false);
                    if (!found) {
                      setRecheckNotice(`Checked Firestore for "${user.email}" and UID "${user.uid}". No admin record found yet. Please make sure a document exists in "adminUsers" or "admins" with your email or UID.`);
                    }
                  }}
                  isLoading={recheckingAdmin}
                >
                  Verify Admin Access Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white font-bold"
                  onClick={logout}
                >
                  Log Out / Switch
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── GOD-LEVEL SIDEBAR + CONTENT WORKSPACE ───
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-surface-50 overflow-hidden">

      {/* ─── MOBILE ADMIN TOP HORIZONTAL NAVIGATION BAR (Visible < md) ─── */}
      <div className="md:hidden bg-surface-900 text-surface-300 border-b border-surface-800 shrink-0 select-none">
        <div className="flex items-center justify-between px-3 py-2 border-b border-surface-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-black text-white block uppercase leading-tight truncate max-w-[140px]">
                {user.fullName || 'Venue Admin'}
              </span>
              <span className="text-[9px] text-emerald-400 font-bold block leading-none">
                Staff Control Mode
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/"
              className="text-[10px] font-bold text-surface-400 hover:text-white px-2 py-1 rounded-md bg-surface-800"
            >
              Site ↗
            </Link>
            <button
              onClick={logout}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded-md bg-red-950/60"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Scrollable View Tabs on Mobile */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 overflow-x-auto no-scrollbar">
          {([
            { key: 'overview' as const, icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Overview', badge: 0 },
            { key: 'approvals' as const, icon: <Clock className="w-3.5 h-3.5 text-amber-400" />, label: 'Queue', badge: pendingOrders.length },
            { key: 'courts' as const, icon: <Calendar className="w-3.5 h-3.5 text-emerald-400" />, label: 'Courts', badge: 0 },
            { key: 'manual' as const, icon: <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />, label: 'Walk-in', badge: 0 },
            { key: 'orders' as const, icon: <FileText className="w-3.5 h-3.5" />, label: 'Ledger', badge: 0 },
            { key: 'revenue' as const, icon: <Banknote className="w-3.5 h-3.5 text-emerald-400" />, label: 'Revenue', badge: 0 },
            { key: 'customers' as const, icon: <Users className="w-3.5 h-3.5" />, label: 'Players', badge: 0 },
            { key: 'pricing' as const, icon: <Coins className="w-3.5 h-3.5 text-yellow-400" />, label: 'Rates', badge: 0 },
            { key: 'closures' as const, icon: <Ban className="w-3.5 h-3.5 text-red-400" />, label: 'Holidays', badge: 0 },
            { key: 'announcements' as const, icon: <Megaphone className="w-3.5 h-3.5 text-blue-400" />, label: 'Notice', badge: 0 },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1',
                activeView === tab.key ? 'bg-emerald-700 text-white shadow-sm' : 'bg-surface-800 text-surface-400'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-amber-950">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DESKTOP LEFT SIDEBAR NAVIGATION (Visible md+) ─── */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-surface-900 text-surface-300 border-r border-surface-800 flex-col justify-between shrink-0 select-none overflow-y-auto">
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
            {([
              { key: 'overview' as const, icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard Overview', badge: 0, count: -1 },
              { key: 'approvals' as const, icon: <Clock className="w-4 h-4 text-amber-400" />, label: 'Pending Queue', badge: pendingOrders.length, count: -1 },
              { key: 'courts' as const, icon: <Calendar className="w-4 h-4 text-emerald-400" />, label: 'Court Schedule Master', badge: 0, count: -1 },
              { key: 'manual' as const, icon: <PlusCircle className="w-4 h-4 text-cyan-400" />, label: 'Walk-in / Offline Desk', badge: 0, count: -1 },
              { key: 'orders' as const, icon: <FileText className="w-4 h-4" />, label: 'All Bookings Ledger', badge: 0, count: orders.length },
              { key: 'revenue' as const, icon: <Banknote className="w-4 h-4 text-emerald-400" />, label: 'Revenue & Finance', badge: 0, count: -1 },
              { key: 'customers' as const, icon: <Users className="w-4 h-4" />, label: 'Players Directory', badge: 0, count: customerDirectory.length },
            ]).map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                  activeView === item.key
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
                )}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-amber-950 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.count >= 0 && item.badge === 0 && (
                  <span className="text-[11px] font-mono opacity-60">{item.count}</span>
                )}
              </button>
            ))}

            {/* Separator */}
            <div className="pt-3 pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-surface-600 px-3.5">Settings</span>
            </div>

            {([
              { key: 'pricing' as const, icon: <Coins className="w-4 h-4 text-yellow-400" />, label: 'Pricing & Rates Manager' },
              { key: 'closures' as const, icon: <Ban className="w-4 h-4 text-red-400" />, label: 'Holiday & Court Locks' },
              { key: 'announcements' as const, icon: <Megaphone className="w-4 h-4 text-blue-400" />, label: 'Public Announcement' },
            ]).map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                  activeView === item.key
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
                )}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              </button>
            ))}
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
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto h-full space-y-6">

        {/* ─── TOP LIVE SYNC STATUS & CONTROLS HEADER ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-surface-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-surface-900 uppercase tracking-wider">
                  Live Cloud Sync Active
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </div>
              <p className="text-[11px] text-surface-500">
                New customer bookings &amp; online payments appear automatically in 0s.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm',
                isSyncing
                  ? 'bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed'
                  : 'bg-white hover:bg-surface-50 text-surface-700 border-surface-300 hover:text-surface-900'
              )}
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin text-emerald-600')} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* ─── FLOATING INCOMING NEW ORDER ALERT ─── */}
        {newOrderAlert && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-xs uppercase font-black tracking-wider text-amber-200 block">
                  🔔 New Court Booking Received!
                </span>
                <p className="text-sm font-bold text-white">
                  <strong>{newOrderAlert.customerName}</strong> ({newOrderAlert.customerPhone}) booked{' '}
                  {newOrderAlert.date} at {formatSlotTime(newOrderAlert.startTime, newOrderAlert.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveView('approvals');
                  setNewOrderAlert(null);
                }}
                className="px-4 py-2 rounded-xl bg-white text-amber-900 text-xs font-black uppercase tracking-wider hover:bg-amber-50 transition-colors shadow-md"
              >
                Review Request Now
              </button>
              <button
                type="button"
                onClick={() => setNewOrderAlert(null)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
                          {order.paymentStatus === 'received' ? (
                            <span className="text-emerald-700 font-extrabold">✓ Paid ({(order.paymentMethod || 'Online').toUpperCase()})</span>
                          ) : order.paymentMethod === 'pay_online' ? (
                            <span className="text-purple-700 font-bold">Online (Pending)</span>
                          ) : (
                            'Pay on Arrival'
                          )}
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
                      </Button>
                    </div>
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
                const isClosed = slot.status === 'disabled';

                return (
                  <div
                    key={slot.slotId}
                    className={cn(
                      'p-4 rounded-2xl border-2 flex flex-col justify-between min-h-[110px] transition-all',
                      isConfirmed && 'bg-emerald-50 border-emerald-500 text-emerald-950',
                      isPending && 'bg-amber-50 border-amber-400 text-amber-950',
                      isAvailable && 'bg-white border-surface-200 text-surface-900',
                      isClosed && 'bg-purple-50 border-purple-400 text-purple-950 opacity-75'
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
                      {isClosed && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500 text-white flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Closed
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-current/15 text-xs">
                      {isClosed ? (
                        <span className="text-purple-700 font-bold">{slot.closureReason || 'Holiday / Maintenance'}</span>
                      ) : slot.customerName ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="overflow-hidden">
                            <span className="font-bold block truncate">{slot.customerName}</span>
                            <span className="text-[11px] opacity-75">{slot.customerPhone}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelClick({
                                id: slot.bookingId || slot.slotId,
                                slotId: slot.slotId,
                                name: slot.customerName || 'Player',
                                date: slot.date,
                                time: formatSlotTime(slot.startTime, slot.endTime),
                                code: slot.bookingCode,
                              })
                            }
                            className="p-1.5 rounded-lg bg-red-100/80 hover:bg-red-200 text-red-700 transition-colors shrink-0 flex items-center gap-1 text-[10px] font-bold"
                            title="Cancel Booking & Free Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Release</span>
                          </button>
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
                            {order.status === 'cancelled' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-surface-200 text-surface-700">
                                Cancelled
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-surface-900">
                            {formatNPR(order.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link to={`/order/${order.id}`} target="_blank">
                                <Button size="sm" variant="outline" className="text-[11px] py-1 px-2.5">
                                  Pass ↗
                                </Button>
                              </Link>
                              {(order.status === 'confirmed' || order.status === 'pending') && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCancelClick({
                                      id: order.id,
                                      slotId: order.slotId,
                                      name: order.customerName,
                                      date: order.date,
                                      time: formatSlotTime(order.startTime, order.endTime),
                                      code: order.bookingCode,
                                    })
                                  }
                                  className="p-1 px-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  title="Cancel Booking & Free Slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Cancel</span>
                                </button>
                              )}
                            </div>
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

            {/* Daily Revenue Breakdown Table */}
            <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-card">
              <div className="p-5 border-b border-surface-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-surface-700">
                  Daily Revenue Breakdown (Last 30 days)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 border-b border-surface-200 font-bold text-surface-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Confirmed Bookings</th>
                      <th className="py-3 px-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 font-medium">
                    {dailyRevenueBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-surface-400">No revenue data yet.</td>
                      </tr>
                    ) : (
                      dailyRevenueBreakdown.map((row) => (
                        <tr key={row.date} className="hover:bg-surface-50/60 transition-colors">
                          <td className="py-3 px-4 font-bold text-surface-900">{row.date}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-surface-100 font-bold">{row.count} slots</span>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-emerald-800">{formatNPR(row.total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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

        {/* 8. PRICING & RATES MANAGER */}
        {activeView === 'pricing' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                <Coins className="w-6 h-6 text-yellow-500" />
                <span>Pricing &amp; Rates Manager</span>
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Set per-hour court rates. Changes apply to all future bookings instantly.
              </p>
            </div>

            <form onSubmit={handlePricingSubmit} className="bg-white rounded-3xl border border-surface-200 p-6 sm:p-8 shadow-card space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                    Normal Day Rate (NPR / hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pricingNormalRate}
                    onChange={(e) => setPricingNormalRate(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm font-bold bg-surface-50"
                  />
                  <span className="text-[11px] text-surface-400 mt-1 block">Sun – Fri rate per hour</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                    Saturday Rate (NPR / hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pricingSatRate}
                    onChange={(e) => setPricingSatRate(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm font-bold bg-surface-50"
                  />
                  <span className="text-[11px] text-surface-400 mt-1 block">Saturday premium rate per hour</span>
                </div>
              </div>

              <div className="p-3 bg-surface-50 rounded-xl text-xs text-surface-600">
                <strong>Current Live Rates:</strong> Normal = {formatNPR(pricing.normalDayRate)} / hr, Saturday = {formatNPR(pricing.saturdayRate)} / hr
              </div>

              {pricingSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {pricingSuccessMsg}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-emerald-700 hover:bg-emerald-800 font-black"
                isLoading={pricingSaving}
              >
                Save Pricing Changes
              </Button>
            </form>
          </div>
        )}

        {/* 9. HOLIDAY & COURT LOCKS */}
        {activeView === 'closures' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                <Ban className="w-6 h-6 text-red-500" />
                <span>Holiday &amp; Court Locks</span>
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Block specific dates/hours for holidays, maintenance, or private events. Locked slots cannot be booked.
              </p>
            </div>

            <form onSubmit={handleClosureSubmit} className="bg-white rounded-3xl border border-surface-200 p-6 sm:p-8 shadow-card space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={closureDate}
                    onChange={(e) => setClosureDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-bold bg-surface-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">Start Time</label>
                  <select
                    value={closureStartTime}
                    onChange={(e) => setClosureStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-bold bg-surface-50"
                  >
                    {availableSlotTimes.map((t) => (
                      <option key={t.startTime} value={t.startTime}>{t.startTime}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 uppercase mb-1">End Time</label>
                  <select
                    value={closureEndTime}
                    onChange={(e) => setClosureEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-bold bg-surface-50"
                  >
                    {availableSlotTimes.map((t) => (
                      <option key={t.endTime} value={t.endTime}>{t.endTime}</option>
                    ))}
                    <option value="21:00">21:00</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dashain Holiday, Turf Maintenance, Private Tournament"
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-medium"
                />
              </div>

              {closureSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {closureSuccessMsg}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 font-black"
                isLoading={closureSaving}
              >
                Lock Court Hours
              </Button>
            </form>

            {/* Active Closures List */}
            {closures.length > 0 && (
              <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-card">
                <div className="p-5 border-b border-surface-200">
                  <h3 className="text-xs font-black uppercase tracking-wider text-surface-700">
                    Active Court Locks ({closures.length})
                  </h3>
                </div>
                <div className="divide-y divide-surface-100">
                  {closures.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
                      <div className="text-xs">
                        <span className="font-bold text-surface-900 block">{c.date} — {c.startTime} to {c.endTime}</span>
                        <span className="text-surface-500">{c.reason}</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => { await removeClosure(c.id); }}
                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                        title="Remove closure"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 10. PUBLIC ANNOUNCEMENT */}
        {activeView === 'announcements' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-blue-500" />
                <span>Public Announcement</span>
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Post a notice visible to all users when they open the website. Users can dismiss it until you publish a new one.
              </p>
            </div>

            <form onSubmit={handleAnnouncementSubmit} className="bg-white rounded-3xl border border-surface-200 p-6 sm:p-8 shadow-card space-y-5">
              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dashain Schedule Update"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Write your announcement message here..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-xs font-medium resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAnnActive(!annActive)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    annActive ? 'bg-emerald-600' : 'bg-surface-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                      annActive ? 'translate-x-6' : 'translate-x-0.5'
                    )}
                  />
                </button>
                <span className="text-xs font-bold text-surface-700">
                  {annActive ? 'Active — Visible to all users' : 'Inactive — Hidden from users'}
                </span>
              </div>

              {annSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {annSuccessMsg}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 font-black"
                isLoading={annSaving}
              >
                {annActive ? 'Publish Announcement' : 'Save Draft'}
              </Button>
            </form>

            {announcement && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="font-black text-blue-900">Current Live Announcement</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black', announcement.active ? 'bg-emerald-100 text-emerald-900' : 'bg-surface-200 text-surface-600')}>
                    {announcement.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="font-bold text-blue-900">{announcement.title || '(No title)'}</p>
                <p className="text-blue-800">{announcement.message || '(No message)'}</p>
              </div>
            )}
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

      {/* Cancel / Release Slot Confirmation Modal */}
      {cancelingTarget && (
        <Modal
          isOpen={true}
          onClose={() => setCancelingTarget(null)}
          title="Cancel Booking & Release Slot"
          description={`Are you sure you want to cancel ${cancelingTarget.name}'s booking on ${cancelingTarget.date} (${cancelingTarget.time})?`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1.5">
              <p className="font-bold text-red-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                This will immediately unlock the slot!
              </p>
              <p className="text-[11px] leading-relaxed">
                Releasing this slot will delete the court lock and make this hour immediately available for other players or walk-in customers to book.
              </p>
              {cancelingTarget.code && (
                <p className="font-mono font-bold pt-1">Code: {cancelingTarget.code}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase mb-1">
                Cancellation Reason (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Player requested cancellation / Team emergency"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-surface-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCancelingTarget(null)}>
                Keep Booking
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 font-black text-white"
                onClick={handleCancelConfirm}
                isLoading={processingId === cancelingTarget.id}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Yes, Release Slot
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export const AdminDashboardPage: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Admin Workspace Recovery Mode">
      <AdminDashboardInner />
    </ErrorBoundary>
  );
};

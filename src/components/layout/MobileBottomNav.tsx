import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import { AuthModal } from '@/components/common/AuthModal';
import { AnnouncementModal } from '@/components/common/AnnouncementModal';
import {
  Home,
  Calendar,
  Ticket,
  Shield,
  User,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { announcement } = useBooking();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-200 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto text-center">
          {/* Left 1: Home */}
          <Link
            to="/"
            className={cn(
              'flex flex-col items-center justify-center py-1 transition-colors',
              isActive('/') ? 'text-emerald-700 font-extrabold' : 'text-surface-500 hover:text-surface-900'
            )}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </Link>

          {/* Left 2: My Passes / Bookings */}
          <Link
            to="/customer/bookings"
            className={cn(
              'flex flex-col items-center justify-center py-1 transition-colors',
              isActive('/customer/bookings')
                ? 'text-emerald-700 font-extrabold'
                : 'text-surface-500 hover:text-surface-900'
            )}
          >
            <div className="relative inline-block">
              <Ticket className="w-5 h-5 mb-0.5" />
              {user && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">Passes</span>
          </Link>

          {/* Center: Book Court Elevated Button */}
          <Link
            to="/book"
            className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-700 to-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black tracking-tight text-emerald-800 mt-1 whitespace-nowrap">
              Book Court
            </span>
          </Link>

          {/* Right 1: Admin (if admin) OR Notices (if customer) */}
          {isAdmin ? (
            <Link
              to="/admin"
              className={cn(
                'flex flex-col items-center justify-center py-1 transition-colors',
                isActive('/admin')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-surface-500 hover:text-surface-900'
              )}
            >
              <div className="relative inline-block">
                <Shield className="w-5 h-5 mb-0.5 text-emerald-700" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
              </div>
              <span className="text-[10px] font-bold tracking-tight text-emerald-800">Admin</span>
            </Link>
          ) : (
            <button
              onClick={() => setNoticeModalOpen(true)}
              type="button"
              className="flex flex-col items-center justify-center py-1 text-surface-500 hover:text-surface-900 transition-colors"
            >
              <div className="relative inline-block">
                <Bell className="w-5 h-5 mb-0.5" />
                {announcement?.active && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight">Notices</span>
            </button>
          )}

          {/* Right 2: Profile / Login */}
          {user ? (
            <Link
              to="/customer/bookings"
              className={cn(
                'flex flex-col items-center justify-center py-1 transition-colors',
                isActive('/customer/profile')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-surface-500 hover:text-surface-900'
              )}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[10px] mb-0.5 border border-emerald-300 mx-auto">
                {user.fullName ? user.fullName[0].toUpperCase() : 'M'}
              </div>
              <span className="text-[10px] font-bold tracking-tight truncate max-w-[48px]">
                {user.fullName ? user.fullName.split(' ')[0] : 'Profile'}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              type="button"
              className="flex flex-col items-center justify-center py-1 text-surface-500 hover:text-surface-900 transition-colors"
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-tight">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Notice / Announcement Modal Trigger */}
      <AnnouncementModal isOpen={noticeModalOpen} onClose={() => setNoticeModalOpen(false)} />
    </>
  );
};

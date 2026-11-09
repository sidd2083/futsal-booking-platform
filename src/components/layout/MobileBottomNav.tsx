import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePWA } from '@/context/PWAContext';
import { AuthModal } from '@/components/common/AuthModal';
import {
  Home,
  Calendar,
  Ticket,
  Shield,
  User,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { promptInstall, isInstalled } = usePWA();
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {/* 1. Home */}
          <Link
            to="/"
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-1 transition-colors',
              isActive('/') ? 'text-emerald-700' : 'text-surface-500 hover:text-surface-900'
            )}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </Link>

          {/* 2. My Passes / Bookings */}
          <Link
            to="/customer/bookings"
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-1 transition-colors',
              isActive('/customer/bookings')
                ? 'text-emerald-700'
                : 'text-surface-500 hover:text-surface-900'
            )}
          >
            <div className="relative">
              <Ticket className="w-5 h-5 mb-0.5" />
              {user && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">My Passes</span>
          </Link>

          {/* 3. Center CTA: Book Your Slot */}
          <Link
            to="/book"
            className="flex flex-col items-center justify-center flex-1 -mt-4 transition-transform active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-700 to-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black tracking-tight text-emerald-800 mt-0.5">
              Book
            </span>
          </Link>

          {/* 4. Admin Command (if admin) OR Download App */}
          {isAdmin ? (
            <Link
              to="/admin"
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 transition-colors',
                isActive('/admin')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-surface-500 hover:text-surface-900'
              )}
            >
              <div className="relative">
                <Shield className="w-5 h-5 mb-0.5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Admin</span>
            </Link>
          ) : (
            <button
              onClick={promptInstall}
              type="button"
              className="flex flex-col items-center justify-center flex-1 py-1 text-surface-500 hover:text-surface-900 transition-colors"
            >
              <Download className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-tight">
                {isInstalled ? 'App Ready' : 'Get App'}
              </span>
            </button>
          )}

          {/* 5. User / Profile / Login */}
          {user ? (
            <Link
              to="/customer/bookings"
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 transition-colors',
                isActive('/customer/profile')
                  ? 'text-emerald-700'
                  : 'text-surface-500 hover:text-surface-900'
              )}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[11px] mb-0.5 border border-emerald-300">
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
              className="flex flex-col items-center justify-center flex-1 py-1 text-surface-500 hover:text-surface-900 transition-colors"
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-tight">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import {
  Menu,
  X,
  Calendar,
  User,
  Shield,
  LogOut,
  CheckCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, loginWithGoogle, logout, updateProfile, devSwitchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '');
  const [nameInput, setNameInput] = useState(user?.fullName || '');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/#about' },
    { label: 'Pitch & Amenities', path: '/#amenities' },
    { label: 'Gallery', path: '/#gallery' },
    { label: 'Location', path: '/#location' },
    { label: 'Contact', path: '/#contact' },
  ];

  const handleOpenProfile = () => {
    setNameInput(user?.fullName || '');
    setPhoneInput(user?.phoneNumber || '');
    setProfileSaveSuccess(false);
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.length < 8) return;
    await updateProfile({ fullName: nameInput, phoneNumber: phoneInput });
    setProfileSaveSuccess(true);
    setTimeout(() => {
      setProfileModalOpen(false);
      setProfileSaveSuccess(false);
    }, 1200);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-surface-900 leading-tight">
                  KATHMANDU <span className="text-brand-700">TURF</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-surface-500">
                  Futsal Arena • Nepal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.path}
                  className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right Action Suite */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Primary Book CTA */}
              <Link to="/book">
                <Button size="sm" variant="primary" leftIcon={<Calendar className="w-4 h-4" />}>
                  Book Your Slot
                </Button>
              </Link>

              {/* User / Authentication Dropdown */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-surface-200">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button size="sm" variant="secondary" leftIcon={<Shield className="w-3.5 h-3.5 text-brand-700" />}>
                        Admin
                      </Button>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleOpenProfile}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors text-left"
                    title="View Profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'P'}
                    </div>
                    <div className="hidden lg:block text-xs">
                      <div className="font-semibold text-surface-800 leading-none truncate max-w-[100px]">
                        {user.fullName.split(' ')[0]}
                      </div>
                      <span className="text-[10px] text-surface-500">
                        {user.phoneNumber ? 'Verified' : 'Add Phone'}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={logout}
                    className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={loginWithGoogle} leftIcon={<User className="w-4 h-4" />}>
                    Sign In
                  </Button>
                  {/* Dev shortcut to preview admin functionality */}
                  {devSwitchRole && (
                    <button
                      onClick={() => devSwitchRole('admin')}
                      className="text-[10px] font-semibold text-surface-500 hover:text-brand-700 underline px-1"
                      title="Quick Admin Preview"
                    >
                      Staff View
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              <Link to="/book">
                <Button size="sm" variant="primary">
                  Book
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-surface-600 hover:text-surface-900 rounded-lg"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-surface-200 bg-white px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-surface-700 hover:text-surface-900 py-1"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/customer/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-brand-700 py-1"
              >
                My Bookings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-surface-900 py-1 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-brand-700" /> Admin Command Center
                </Link>
              )}
            </nav>

            <div className="pt-3 border-t border-surface-200">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-surface-900">{user.fullName}</div>
                    <div className="text-xs text-surface-500">{user.phoneNumber || 'No phone set'}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={logout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button size="md" variant="outline" className="w-full" onClick={loginWithGoogle}>
                  Sign In with Google
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Customer Profile Completion Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Customer Profile"
        description="Your verified phone number is required so our venue managers can confirm your booking requests."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-surface-600 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Suman Shrestha"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-surface-600 mb-1">
              Contact Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-surface-400 font-medium">+977</span>
              <input
                type="tel"
                required
                value={phoneInput.replace('+977', '').trim()}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full pl-16 pr-3.5 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="98XXXXXXXX"
              />
            </div>
            <p className="text-[11px] text-surface-500 mt-1">
              Our staff calls this number to approve Pay on Arrival requests.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-surface-600 mb-1">
              Connected Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-200 bg-surface-50 text-surface-500 text-sm cursor-not-allowed"
            />
          </div>

          {profileSaveSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Profile saved successfully!
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link to="/customer/bookings" onClick={() => setProfileModalOpen(false)}>
              <span className="text-xs font-semibold text-brand-700 hover:underline">
                View My Bookings & Codes →
              </span>
            </Link>
            <Button type="submit" variant="primary" size="md">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

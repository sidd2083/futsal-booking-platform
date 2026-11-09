import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { AuthModal } from '@/components/common/AuthModal';
import { Logo } from '@/components/common/Logo';
import {
  Menu,
  X,
  Calendar,
  User,
  Shield,
  LogOut,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout, updateProfile, needsProfileCompletion, dismissProfileCompletion } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/#home' },
    { label: 'About Us', path: '/#about' },
    { label: 'Facilities', path: '/#facilities' },
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
    const res = await updateProfile({ fullName: nameInput, phoneNumber: phoneInput });
    if (res.success) {
      setProfileSaveSuccess(true);
      setTimeout(() => {
        setProfileModalOpen(false);
        setProfileSaveSuccess(false);
      }, 1200);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22">
            
            {/* Logo */}
            <Link to="/" className="flex items-center py-2">
              <Logo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.path}
                  className="text-xs uppercase font-bold tracking-wider text-surface-600 hover:text-surface-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right Action Suite */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Order History Link */}
              <Link to="/customer/bookings">
                <Button
                  size="sm"
                  variant="outline"
                  className="font-bold border-surface-300 text-surface-800 hover:bg-surface-100"
                  leftIcon={<Clock className="w-3.5 h-3.5 text-emerald-700" />}
                >
                  Order History
                </Button>
              </Link>

              {/* Primary Book CTA */}
              <Link to="/book">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-emerald-700 hover:bg-emerald-800 font-bold"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  Book Your Slot
                </Button>
              </Link>

              {/* User Dropdown or Sign In */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-surface-200">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button size="sm" variant="secondary" leftIcon={<Shield className="w-3.5 h-3.5 text-emerald-700" />}>
                        Admin
                      </Button>
                    </Link>
                  )}

                  <button
                    onClick={handleOpenProfile}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors text-left"
                    title="View Profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'M'}
                    </div>
                    <div className="hidden lg:block text-xs">
                      <div className="font-semibold text-surface-800 leading-none truncate max-w-[100px]">
                        {user.fullName ? user.fullName.split(' ')[0] : 'Player'}
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAuthModalOpen(true)}
                    leftIcon={<User className="w-4 h-4" />}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              <Link to="/book">
                <Button size="sm" variant="primary" className="bg-emerald-700 hover:bg-emerald-800">
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
                  className="text-sm font-semibold text-surface-700 hover:text-surface-900 py-1"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/customer/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-emerald-700 py-1"
              >
                My Bookings & Codes
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-surface-900 py-1 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-emerald-700" /> Admin Command Center
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
                <Button
                  size="md"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                >
                  Sign In / Register
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal (Google & Email/Password) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Profile Modal (Required for phone verification) */}
      <Modal
        isOpen={profileModalOpen || needsProfileCompletion}
        onClose={() => {
          setProfileModalOpen(false);
          dismissProfileCompletion();
        }}
        title="Complete Player Profile"
        description="A verified mobile phone number is required so our venue managers can confirm Pay on Arrival reservations."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-surface-600 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={nameInput || user?.fullName || ''}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Suman Shrestha"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-surface-600 mb-1">
              Contact Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-surface-400 font-bold">+977</span>
              <input
                type="tel"
                required
                value={phoneInput || user?.phoneNumber || ''}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full pl-16 pr-3.5 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="98XXXXXXXX"
              />
            </div>
            <p className="text-[11px] text-surface-500 mt-1">
              Our staff calls this number to verify your booking request.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-surface-600 mb-1">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-200 bg-surface-50 text-surface-500 text-sm cursor-not-allowed"
            />
          </div>

          {profileSaveSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Profile saved successfully!
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link to="/customer/bookings" onClick={() => setProfileModalOpen(false)}>
              <span className="text-xs font-semibold text-emerald-700 hover:underline">
                View My Bookings & Slips →
              </span>
            </Link>
            <Button type="submit" variant="primary" size="md" className="bg-emerald-700 hover:bg-emerald-800">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

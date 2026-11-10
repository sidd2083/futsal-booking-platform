import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signin',
  onSuccess,
}) => {
  const { user, loginWithGoogle, loginWithEmailPassword, registerWithEmailPassword, updateProfile } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register' | 'complete_profile'>(defaultTab);

  // Sign-in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Complete profile state (for Google sign-in or incomplete accounts)
  const [profileFullName, setProfileFullName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setErrorMessage(null);
    }
  }, [isOpen, defaultTab]);

  const resetForm = () => {
    setSignInEmail('');
    setSignInPassword('');
    setRegFullName('');
    setRegPhone('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setProfileFullName('');
    setProfilePhone('');
    setErrorMessage(null);
  };

  const checkNeedsProfile = (currentUser: any): boolean => {
    if (!currentUser) return false;
    const hasPhone = currentUser.phoneNumber && currentUser.phoneNumber.trim().length >= 8;
    const hasName = currentUser.fullName && currentUser.fullName.trim().length >= 2;
    return !hasPhone || !hasName;
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);

    if (res.success) {
      try {
        const cached = localStorage.getItem('maya_auth_cached_profile');
        const curUser = cached ? JSON.parse(cached) : user;
        if (checkNeedsProfile(curUser)) {
          setProfileFullName(curUser?.fullName || '');
          setProfilePhone(curUser?.phoneNumber || '');
          setTab('complete_profile');
          return;
        }
      } catch {
        // continue
      }
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.error || 'Google Sign-In failed.');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    const res = await loginWithEmailPassword(signInEmail, signInPassword);
    setIsLoading(false);

    if (res.success) {
      try {
        const cached = localStorage.getItem('maya_auth_cached_profile');
        const curUser = cached ? JSON.parse(cached) : user;
        if (checkNeedsProfile(curUser)) {
          setProfileFullName(curUser?.fullName || '');
          setProfilePhone(curUser?.phoneNumber || '');
          setTab('complete_profile');
          return;
        }
      } catch {
        // continue
      }
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.error || 'Invalid email or password.');
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    const res = await registerWithEmailPassword({
      fullName: regFullName,
      phoneNumber: regPhone,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });
    setIsLoading(false);

    if (res.success) {
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = profileFullName.trim();
    if (cleanName.length < 2) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    const cleanPhone = profilePhone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^(98|97|96)/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Nepali mobile number starting with 98 or 97.');
      return;
    }

    setIsLoading(true);
    const res = await updateProfile({
      fullName: cleanName,
      phoneNumber: cleanPhone,
    });
    setIsLoading(false);

    if (res.success) {
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.error || 'Failed to update profile.');
    }
  };

  let modalTitle = 'Sign In to Maya Sports';
  let modalDescription = 'Sign in to reserve court slots and view your confirmed booking slips.';

  if (tab === 'register') {
    modalTitle = 'Create Player Account';
    modalDescription = 'Register with your name, mobile number, and email for fast court reservations.';
  } else if (tab === 'complete_profile') {
    modalTitle = 'Complete Your Player Details';
    modalDescription = 'Enter your legal name and contact number so venue staff can verify and confirm your match bookings.';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ─── TAB C: COMPLETE PROFILE STEP (for Google Sign-In or missing details) ─── */}
        {tab === 'complete_profile' ? (
          <form onSubmit={handleCompleteProfileSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Signed in successfully! Please confirm your name and phone number below.</span>
            </div>

            <div>
              <label className="block font-bold uppercase text-surface-700 mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-surface-400" />
                <input
                  type="text"
                  required
                  value={profileFullName}
                  onChange={(e) => setProfileFullName(e.target.value)}
                  placeholder="e.g. Ramesh Thapa"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase text-surface-700 mb-1">
                Contact Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-surface-400 font-bold">+977</span>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-14 pr-3 py-2 rounded-xl border border-surface-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-surface-500 mt-1">
                Venue managers will call this 10-digit number to verify and approve your booking.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full bg-emerald-700 hover:bg-emerald-800 font-black py-2.5 mt-2"
              isLoading={isLoading}
            >
              Save Profile &amp; Continue
            </Button>
          </form>
        ) : (
          <>
            {/* Google One-Click CTA */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-surface-800 text-xs font-bold transition-all shadow-subtle hover:border-surface-300 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                Or with email
              </span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>

            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-surface-100 p-1 border border-surface-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  tab === 'signin' ? 'bg-white text-surface-900 shadow-sm font-bold' : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  tab === 'register' ? 'bg-white text-surface-900 shadow-sm font-bold' : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Register
              </button>
            </div>

            {/* TAB A: SIGN IN FORM */}
            {tab === 'signin' && (
              <form onSubmit={handleEmailSignIn} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold uppercase text-surface-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-surface-400" />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-surface-600 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-surface-400" />
                    <input
                      type="password"
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 font-black py-2.5"
                  isLoading={isLoading}
                >
                  Sign In
                </Button>
              </form>
            )}

            {/* TAB B: REGISTER FORM */}
            {tab === 'register' && (
              <form onSubmit={handleEmailRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold uppercase text-surface-600 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-surface-400" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Suman Shrestha"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-surface-600 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-surface-400 font-bold">+977</span>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full pl-14 pr-3 py-2 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-surface-500 mt-0.5">
                    Staff calls this number to verify Pay on Arrival requests.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-surface-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-surface-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold uppercase text-surface-600 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-surface-400" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-surface-600 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-surface-400" />
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 font-black py-2.5"
                  isLoading={isLoading}
                >
                  Complete Registration
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

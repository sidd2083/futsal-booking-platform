import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

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
  const { loginWithGoogle, loginWithEmailPassword, registerWithEmailPassword } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>(defaultTab);

  // Sign-in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setSignInEmail('');
    setSignInPassword('');
    setRegFullName('');
    setRegPhone('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setErrorMessage(null);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (res.success) {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tab === 'signin' ? 'Sign In to Maya Sports' : 'Create Player Account'}
      description={
        tab === 'signin'
          ? 'Sign in to reserve court slots and view your confirmed booking slips.'
          : 'Register with your phone number and email for fast court reservations.'
      }
      className="max-w-md"
    >
      <div className="space-y-4">
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
        <div className="flex rounded-lg bg-surface-100 p-1 border border-surface-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              tab === 'signin' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'
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
            className={`flex-1 py-1.5 rounded-md transition-all ${
              tab === 'register' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

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
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 font-bold"
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
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase text-surface-600 mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-surface-400 font-bold">+977</span>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-14 pr-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 font-bold"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};

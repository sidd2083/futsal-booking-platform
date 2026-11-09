import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthProviderType } from '@/types';
import { auth, googleProvider, db, isFirebaseConfigured } from '@/lib/firebase';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  needsProfileCompletion: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  registerWithEmailPassword: (params: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithEmailPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName: string; phoneNumber: string }) => Promise<{ success: boolean; error?: string }>;
  dismissProfileCompletion: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'maya_auth_cached_profile';

const PHONE_REGISTRY_CACHE_KEY = 'maya_phone_registry_cache';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Instant User Hydration from Local Cache (0ms delay) ──
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const p = JSON.parse(cached);
        return p.role === 'admin' || p.isAdmin === true;
      }
    } catch {}
    return false;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState<boolean>(false);

  // Fast, non-blocking admin role check
  const checkAdminRole = useCallback(async (uid: string, email?: string | null): Promise<boolean> => {
    if (!db) return false;
    try {
      const cleanEmail = email?.trim().toLowerCase();

      // Quick parallel lookup for admin identity
      const checks: Promise<boolean>[] = [
        getDoc(doc(db, 'adminUsers', uid)).then((s) => s.exists()),
        getDoc(doc(db, 'admins', uid)).then((s) => s.exists()),
        getDoc(doc(db, 'users', uid)).then((s) => {
          if (!s.exists()) return false;
          const d = s.data();
          return d.role?.toLowerCase() === 'admin' || d.isAdmin === true;
        }),
      ];

      if (cleanEmail) {
        checks.push(getDoc(doc(db, 'adminUsers', cleanEmail)).then((s) => s.exists()));
        checks.push(getDoc(doc(db, 'admins', cleanEmail)).then((s) => s.exists()));
      }

      // 2-second timeout protection so auth never hangs
      const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000));
      const anyMatch = Promise.all(checks).then((results) => results.some(Boolean));
      return await Promise.race([anyMatch, timeout]);
    } catch (err) {
      console.warn('Admin check warning:', err);
      return false;
    }
  }, []);

  // Sync profile from Firestore for a given Firebase User
  const syncUserProfile = useCallback(
    async (fbUser: FirebaseUser, providerType: AuthProviderType = 'google') => {
      if (!db) return;

      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userRef);

        const adminStatus = await checkAdminRole(fbUser.uid, fbUser.email);
        setIsAdmin(adminStatus);

        if (snap.exists()) {
          const profileData = snap.data() as UserProfile;
          const merged: UserProfile = {
            ...profileData,
            role: adminStatus ? 'admin' : (profileData.role || 'customer'),
          };
          setUser(merged);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));

          // Check if profile is missing phone number or name
          if (!profileData.phoneNumber || profileData.phoneNumber.trim().length < 8) {
            setNeedsProfileCompletion(true);
          } else {
            setNeedsProfileCompletion(false);
          }
        } else {
          // First-time registration entry
          const nowIso = new Date().toISOString();
          const newProfile: UserProfile = {
            uid: fbUser.uid,
            fullName: fbUser.displayName || '',
            email: fbUser.email || '',
            phoneNumber: fbUser.phoneNumber || '',
            authProvider: providerType,
            photoURL: fbUser.photoURL || undefined,
            role: adminStatus ? 'admin' : 'customer',
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          await setDoc(userRef, {
            ...newProfile,
            createdAtServer: serverTimestamp(),
            updatedAtServer: serverTimestamp(),
          });

          setUser(newProfile);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));

          // Prompt profile completion if phone or name is missing
          if (!newProfile.phoneNumber || newProfile.phoneNumber.trim().length < 8 || !newProfile.fullName) {
            setNeedsProfileCompletion(true);
          }
        }
      } catch (error) {
        console.error('Error synchronizing Firestore user profile:', error);
      }
    },
    [checkAdminRole]
  );

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const isPass = fbUser.providerData.some((p) => p.providerId === 'password');
          await syncUserProfile(fbUser, isPass ? 'password' : 'google');
        } else {
          setUser(null);
          setIsAdmin(false);
          setNeedsProfileCompletion(false);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Offline fallback
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          setIsAdmin(parsed.role === 'admin');
        } catch {
          // ignore error
        }
      }
      setLoading(false);
    }
  }, [syncUserProfile]);

  // Helper to translate Firebase errors into clear, actionable advice
  const formatAuthError = (err: any): string => {
    if (!err) return 'Authentication failed. Please try again.';
    const code = err.code || '';
    const msg = err.message || '';

    if (code === 'auth/operation-not-allowed') {
      return 'Authentication provider is not yet enabled in your Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method, and toggle Enable for both "Email/Password" and "Google".';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid credentials. If you have not created an account yet, please click "Register New Account" to sign up first.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'This email is already registered. Please switch to the "Sign In" tab and enter your password.';
    }
    if (code === 'auth/weak-password') {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was closed before completion. Please click "Continue with Google" again.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Browser blocked the Google sign-in window. Please allow popups for this site and try again.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Domain not authorized. Please add "localhost" under Firebase Console -> Authentication -> Settings -> Authorized Domains.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection error. Please verify your internet connection.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Access is temporarily suspended. Please wait a minute or reset your password.';
    }

    return msg || 'Authentication error. Please check your credentials or Firebase console settings.';
  };

  // Google OAuth flow
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      return { success: false, error: 'Firebase is not initialized.' };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user, 'google');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Email & Password registration
  const registerWithEmailPassword = async (params: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!params.fullName.trim()) {
      return { success: false, error: 'Please enter your full legal name.' };
    }
    const cleanPhone = params.phoneNumber.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      return { success: false, error: 'Please enter a valid Nepali mobile number (at least 8 digits).' };
    }
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (params.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (params.password !== params.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    if (!isFirebaseConfigured || !auth || !db) {
      return { success: false, error: 'Firebase is not initialized.' };
    }

    // ── STRICT PHONE UNIQUENESS CHECK ──
    // 1. Check local registry cache
    try {
      const localPhoneMapStr = localStorage.getItem(PHONE_REGISTRY_CACHE_KEY);
      if (localPhoneMapStr) {
        const localMap: Record<string, string> = JSON.parse(localPhoneMapStr);
        if (localMap[cleanPhone] && localMap[cleanPhone].toLowerCase() !== cleanEmail) {
          return {
            success: false,
            error: `This mobile number (${cleanPhone}) is already registered to another player account. Each phone number can only be used once.`,
          };
        }
      }
    } catch {
      // ignore parse error
    }

    // 2. Check Firestore phoneRegistry document
    try {
      const phoneSnap = await getDoc(doc(db, 'phoneRegistry', cleanPhone));
      if (phoneSnap.exists()) {
        const registeredEmail = phoneSnap.data()?.email?.toLowerCase();
        if (registeredEmail && registeredEmail !== cleanEmail) {
          return {
            success: false,
            error: `This mobile number (${cleanPhone}) is already registered to another player account. Please use your own unique number or sign in.`,
          };
        }
      }
    } catch (err) {
      console.warn('Phone uniqueness check error:', err);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
      const uid = cred.user.uid;
      const nowIso = new Date().toISOString();

      const profile: UserProfile = {
        uid,
        fullName: params.fullName.trim(),
        email: cleanEmail,
        phoneNumber: cleanPhone,
        authProvider: 'password',
        role: 'customer',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      // Save user document
      await setDoc(doc(db, 'users', uid), {
        ...profile,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp(),
      });

      // Claim phone number in local cache
      try {
        const localPhoneMapStr = localStorage.getItem(PHONE_REGISTRY_CACHE_KEY);
        const localMap: Record<string, string> = localPhoneMapStr ? JSON.parse(localPhoneMapStr) : {};
        localMap[cleanPhone] = cleanEmail;
        localStorage.setItem(PHONE_REGISTRY_CACHE_KEY, JSON.stringify(localMap));
      } catch {
        // ignore
      }

      // Claim phone number in Firestore registry
      try {
        await setDoc(doc(db, 'phoneRegistry', cleanPhone), {
          uid,
          email: cleanEmail,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Failed to write phone registry:', err);
      }

      setUser(profile);
      setNeedsProfileCompletion(false);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Email & Password sign-in
  const loginWithEmailPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter your email and password.' };
    }

    if (!isFirebaseConfigured || !auth) {
      return { success: false, error: 'Firebase is not initialized.' };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      // Run profile sync in background so login returns immediately
      syncUserProfile(cred.user, 'password').catch((err) =>
        console.warn('Background sync error (non-fatal):', err)
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    setUser(null);
    setIsAdmin(false);
    setNeedsProfileCompletion(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const updateProfile = async (data: {
    fullName: string;
    phoneNumber: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated.' };
    const cleanPhone = data.phoneNumber.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      return { success: false, error: 'Please enter a valid phone number (at least 8 digits).' };
    }

    if (isFirebaseConfigured && db) {
      try {
        const phoneSnap = await getDoc(doc(db, 'phoneRegistry', cleanPhone));
        if (phoneSnap.exists() && phoneSnap.data()?.uid !== user.uid) {
          return {
            success: false,
            error: 'This mobile number is already registered to another player account. Please use your own unique number.',
          };
        }

        // Claim phone in registry
        await setDoc(doc(db, 'phoneRegistry', cleanPhone), {
          uid: user.uid,
          email: user.email,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Phone registry check error:', err);
      }
    }

    const updated: UserProfile = {
      ...user,
      fullName: data.fullName.trim() || user.fullName,
      phoneNumber: cleanPhone,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            fullName: updated.fullName,
            phoneNumber: updated.phoneNumber,
            updatedAt: updated.updatedAt,
            updatedAtServer: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update profile.' };
      }
    }

    setUser(updated);
    setNeedsProfileCompletion(false);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { success: true };
  };

  const dismissProfileCompletion = () => {
    setNeedsProfileCompletion(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isConfigured: isFirebaseConfigured,
        needsProfileCompletion,
        loginWithGoogle,
        registerWithEmailPassword,
        loginWithEmailPassword,
        logout,
        updateProfile,
        dismissProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthProviderType } from '@/types';
import { auth, googleProvider, db, isFirebaseConfigured } from '@/lib/firebase';
import { sanitizeFirestoreData } from '@/lib/utils';
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
  collection,
  query,
  where,
  getDocs,
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
  recheckAdmin: () => Promise<boolean>;
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

  // Exhaustive & resilient admin role check
  const checkAdminRole = useCallback(async (uid: string, rawEmail?: string | null): Promise<boolean> => {
    const firestore = db;
    if (!firestore) return false;
    try {
      const email = rawEmail?.trim() || '';
      const cleanEmail = email.toLowerCase();

      // 1. Direct document lookups (UID or Email as Document ID)
      const directDocPaths = [
        `adminUsers/${uid}`,
        `admins/${uid}`,
        `admin/${uid}`,
        `users/${uid}`,
      ];

      if (cleanEmail) {
        directDocPaths.push(`adminUsers/${cleanEmail}`);
        directDocPaths.push(`admins/${cleanEmail}`);
        directDocPaths.push(`admin/${cleanEmail}`);
        if (email !== cleanEmail) {
          directDocPaths.push(`adminUsers/${email}`);
          directDocPaths.push(`admins/${email}`);
        }
      }

      const directChecks = directDocPaths.map(async (path) => {
        try {
          const parts = path.split('/');
          const snap = await getDoc(doc(firestore, parts[0], parts[1]));
          if (!snap.exists()) return false;
          const data = snap.data();
          if (parts[0] === 'users') {
            const role = (data?.role || '').toString().toLowerCase();
            return role === 'admin' || data?.isAdmin === true || data?.admin === true;
          }
          // In adminUsers / admins / admin collections:
          return true;
        } catch {
          return false;
        }
      });

      // 2. Query lookups (in case document ID is auto-generated or email field is stored)
      const queryChecks: Promise<boolean>[] = [];
      if (cleanEmail) {
        queryChecks.push(
          (async () => {
            try {
              const q1 = query(collection(firestore, 'adminUsers'), where('email', '==', cleanEmail));
              const s1 = await getDocs(q1);
              if (!s1.empty) return true;
              if (email !== cleanEmail) {
                const q1b = query(collection(firestore, 'adminUsers'), where('email', '==', email));
                const s1b = await getDocs(q1b);
                if (!s1b.empty) return true;
              }
              return false;
            } catch {
              return false;
            }
          })(),
          (async () => {
            try {
              const q2 = query(collection(firestore, 'admins'), where('email', '==', cleanEmail));
              const s2 = await getDocs(q2);
              if (!s2.empty) return true;
              return false;
            } catch {
              return false;
            }
          })(),
          (async () => {
            try {
              const q3 = query(collection(firestore, 'users'), where('email', '==', cleanEmail));
              const s3 = await getDocs(q3);
              for (const docSnap of s3.docs) {
                const d = docSnap.data();
                const r = (d?.role || '').toString().toLowerCase();
                if (r === 'admin' || d?.isAdmin === true || d?.admin === true) {
                  return true;
                }
              }
              return false;
            } catch {
              return false;
            }
          })()
        );
      }

      // Check uid in adminUsers by query
      queryChecks.push(
        (async () => {
          try {
            const qu = query(collection(firestore, 'adminUsers'), where('uid', '==', uid));
            const su = await getDocs(qu);
            return !su.empty;
          } catch {
            return false;
          }
        })()
      );

      const allChecks = [...directChecks, ...queryChecks];
      const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000));
      const anyMatch = Promise.all(allChecks).then((results) => results.some(Boolean));
      return await Promise.race([anyMatch, timeout]);
    } catch (err) {
      console.warn('Admin check warning:', err);
      return false;
    }
  }, []);

  // Sync profile from Firestore for a given Firebase User
  const syncUserProfile = useCallback(
    async (fbUser: FirebaseUser, providerType: AuthProviderType = 'google') => {
      // 0ms instant hydration from current auth object
      const nowIso = new Date().toISOString();
      const fallbackProfile: UserProfile = {
        uid: fbUser.uid,
        fullName: fbUser.displayName || '',
        email: fbUser.email || '',
        phoneNumber: fbUser.phoneNumber || '',
        authProvider: providerType,
        photoURL: fbUser.photoURL || '',
        role: 'customer',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (!db) {
        setUser(fallbackProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackProfile));
        return;
      }

      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const [snap, adminStatus] = await Promise.all([
          getDoc(userRef),
          checkAdminRole(fbUser.uid, fbUser.email),
        ]);

        const snapIsAdmin = snap.exists() && (
          (snap.data()?.role || '').toString().toLowerCase() === 'admin' ||
          snap.data()?.isAdmin === true ||
          snap.data()?.admin === true
        );
        const finalAdmin = adminStatus || snapIsAdmin;
        setIsAdmin(finalAdmin);

        if (snap.exists()) {
          const profileData = snap.data() as UserProfile;
          const merged: UserProfile = {
            ...profileData,
            fullName: profileData.fullName || fbUser.displayName || '',
            email: profileData.email || fbUser.email || '',
            phoneNumber: profileData.phoneNumber || fbUser.phoneNumber || '',
            photoURL: profileData.photoURL || fbUser.photoURL || '',
            role: finalAdmin ? 'admin' : (profileData.role || 'customer'),
          };
          setUser(merged);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));

          // Prompt profile completion if phone or name is missing
          if (!merged.phoneNumber || merged.phoneNumber.trim().length < 8 || !merged.fullName || merged.fullName.trim().length < 2) {
            setNeedsProfileCompletion(true);
          } else {
            setNeedsProfileCompletion(false);
          }
        } else {
          // First-time registration entry
          const newProfile: UserProfile = {
            uid: fbUser.uid,
            fullName: fbUser.displayName || '',
            email: fbUser.email || '',
            phoneNumber: fbUser.phoneNumber || '',
            authProvider: providerType,
            photoURL: fbUser.photoURL || '',
            role: finalAdmin ? 'admin' : 'customer',
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          await setDoc(userRef, sanitizeFirestoreData({
            ...newProfile,
            createdAtServer: serverTimestamp(),
            updatedAtServer: serverTimestamp(),
          }));

          setUser(newProfile);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));

          if (!newProfile.phoneNumber || newProfile.phoneNumber.trim().length < 8 || !newProfile.fullName || newProfile.fullName.trim().length < 2) {
            setNeedsProfileCompletion(true);
          } else {
            setNeedsProfileCompletion(false);
          }
        }
      } catch (error) {
        console.error('Error synchronizing Firestore user profile:', error);
        setUser(fallbackProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackProfile));
      }
    },
    [checkAdminRole]
  );

  // Recheck admin status on demand
  const recheckAdmin = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    const isNowAdmin = await checkAdminRole(user.uid, user.email);
    if (isNowAdmin) {
      setIsAdmin(true);
      const updated = { ...user, role: 'admin' as const };
      setUser(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    return isNowAdmin;
  }, [user, checkAdminRole]);

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
      await setDoc(doc(db, 'users', uid), sanitizeFirestoreData({
        ...profile,
        photoURL: profile.photoURL || '',
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp(),
      }));

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
        await setDoc(doc(db, 'phoneRegistry', cleanPhone), sanitizeFirestoreData({
          uid,
          email: cleanEmail,
          createdAt: serverTimestamp(),
        }));
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
      // Synchronize profile immediately before resolving
      await syncUserProfile(cred.user, 'password');
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
        await setDoc(doc(db, 'phoneRegistry', cleanPhone), sanitizeFirestoreData({
          uid: user.uid,
          email: user.email || '',
          updatedAt: serverTimestamp(),
        }));
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
          sanitizeFirestoreData({
            fullName: updated.fullName,
            phoneNumber: updated.phoneNumber,
            updatedAt: updated.updatedAt,
            updatedAtServer: serverTimestamp(),
          }),
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
        recheckAdmin,
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

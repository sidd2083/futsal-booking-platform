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
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState<boolean>(false);

  // Check admin status against /adminUsers/{uid} or /admins/{uid}
  const checkAdminRole = useCallback(async (uid: string): Promise<boolean> => {
    if (!db) return false;
    try {
      const adminSnap1 = await getDoc(doc(db, 'adminUsers', uid));
      if (adminSnap1.exists()) return true;
      const adminSnap2 = await getDoc(doc(db, 'admins', uid));
      if (adminSnap2.exists()) return true;
    } catch (err) {
      console.warn('Admin check error:', err);
    }
    return false;
  }, []);

  // Sync profile from Firestore for a given Firebase User
  const syncUserProfile = useCallback(
    async (fbUser: FirebaseUser, providerType: AuthProviderType = 'google') => {
      if (!db) return;

      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userRef);

        const adminStatus = await checkAdminRole(fbUser.uid);
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
      let message = 'Google sign-in was cancelled or failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed before completion.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
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
    if (!params.phoneNumber.trim() || params.phoneNumber.trim().length < 8) {
      return { success: false, error: 'Please enter a valid Nepali mobile number (at least 8 digits).' };
    }
    if (!params.email.includes('@')) {
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

    try {
      const cred = await createUserWithEmailAndPassword(auth, params.email.trim(), params.password);
      const uid = cred.user.uid;
      const nowIso = new Date().toISOString();

      const profile: UserProfile = {
        uid,
        fullName: params.fullName.trim(),
        email: params.email.trim().toLowerCase(),
        phoneNumber: params.phoneNumber.trim(),
        authProvider: 'password',
        role: 'customer',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await setDoc(doc(db, 'users', uid), {
        ...profile,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp(),
      });

      setUser(profile);
      setNeedsProfileCompletion(false);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      return { success: true };
    } catch (err: any) {
      let message = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  // Email & Password sign-in
  const loginWithEmailPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password) {
      return { success: false, error: 'Please enter your email and password.' };
    }

    if (!isFirebaseConfigured || !auth) {
      return { success: false, error: 'Firebase is not initialized.' };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncUserProfile(cred.user, 'password');
      return { success: true };
    } catch (err: any) {
      let message = 'Invalid email or password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Incorrect email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please reset your password or try again later.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
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
    if (!data.phoneNumber.trim() || data.phoneNumber.trim().length < 8) {
      return { success: false, error: 'Please enter a valid phone number (at least 8 digits).' };
    }

    const updated: UserProfile = {
      ...user,
      fullName: data.fullName.trim() || user.fullName,
      phoneNumber: data.phoneNumber.trim(),
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

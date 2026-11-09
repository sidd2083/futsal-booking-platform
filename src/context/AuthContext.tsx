import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { auth, googleProvider, db, isFirebaseConfigured } from '@/lib/firebase';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName: string; phoneNumber: string }) => Promise<void>;
  // Dev helper to preview admin mode locally when testing before Firebase is fully linked
  devSwitchRole?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'futsal_auth_mock_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            // Fetch profile from Firestore
            if (db) {
              const userRef = doc(db, 'users', fbUser.uid);
              const snap = await getDoc(userRef);
              if (snap.exists()) {
                setUser(snap.data() as UserProfile);
              } else {
                // Initialize new profile
                const newProfile: UserProfile = {
                  uid: fbUser.uid,
                  fullName: fbUser.displayName || 'Player',
                  email: fbUser.email || '',
                  phoneNumber: fbUser.phoneNumber || '',
                  photoURL: fbUser.photoURL || undefined,
                  role: 'customer',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                await setDoc(userRef, newProfile);
                setUser(newProfile);
              }
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Offline/Local mock user support for instant testing
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          // ignore error
        }
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      await signInWithPopup(auth, googleProvider);
    } else {
      // Clean mock user login for immediate development verification
      const mockUser: UserProfile = {
        uid: 'demo-customer-123',
        fullName: 'Aayush Shrestha',
        email: 'aayush.test@example.com',
        phoneNumber: '9841234567',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const updateProfile = async (data: { fullName: string; phoneNumber: string }) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    setUser(updated);
  };

  const devSwitchRole = (role: UserRole) => {
    if (!user) {
      const newUser: UserProfile = {
        uid: role === 'admin' ? 'admin-demo-999' : 'demo-customer-123',
        fullName: role === 'admin' ? 'Arena Manager (Staff)' : 'Aayush Shrestha',
        email: role === 'admin' ? 'admin@futsalbookingnepal.com' : 'aayush.test@example.com',
        phoneNumber: '9841234567',
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
      return;
    }
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        isConfigured: isFirebaseConfigured,
        loginWithGoogle,
        logout,
        updateProfile,
        devSwitchRole,
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

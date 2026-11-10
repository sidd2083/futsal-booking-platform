import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Production Firebase project configuration (futsal-2f004)
// Fallbacks ensure Vercel deployments run seamlessly even before manual env vars are configured.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBB4aRkDuDwoLHbsnfMLXbrQuuwNYUFzpc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'futsal-2f004.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'futsal-2f004',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'futsal-2f004.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '633222992990',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:633222992990:web:a7343f2e96ae3d068ed0cf',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-H653SYZ4XJ',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_firebase_api_key_here'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn(
    '[Firebase Scaffolding] VITE_FIREBASE_* environment variables are missing or default.'
  );
}

export { app, auth, db, googleProvider };

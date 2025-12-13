"use client";
import {FirebaseApp, getApp, getApps, initializeApp} from "firebase/app";
import {Auth, getAuth} from "firebase/auth";
import {Firestore, getFirestore} from "firebase/firestore";

// Debug log environment variables in development
if (typeof window !== "undefined" && process.env.NODE_ENV !== 'production') {
  console.log('Firebase Config Environment Variables:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***' : 'MISSING',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'MISSING',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'MISSING',
  });
}

// Client-side Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase on client-side only
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined") {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
  );

  if (missingVars.length > 0) {
    console.error('Missing required Firebase environment variables:', missingVars);
  } else {
    try {
      // Check if Firebase is already initialized
      if (getApps().length > 0) {
        app = getApp();
      } else {
        app = initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
      }

      // Initialize auth and firestore
      auth = getAuth(app);
      db = getFirestore(app);

      // Set persistence if needed
      // setPersistence(auth, browserLocalPersistence);

    } catch (error) {
      console.error('Firebase initialization error:', {
        error,
        config: {
          ...firebaseConfig,
          apiKey: firebaseConfig.apiKey ? '***' : 'MISSING'
        }
      });
    }
  }
}

// Export the initialized services
export { app, auth, db };

export const getIdToken = async (): Promise<string | null> => {
  if (!auth) {
    console.warn("Auth not initialized");
    return null;
  }

  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
};

// Auth initialization is now handled in AuthContext

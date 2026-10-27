import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Primary App for normal user authentication
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Helper to create new staff accounts in Firebase without replacing the logged-in Owner session
export const createStaffFirebaseAuth = async (email: string, pass: string): Promise<string> => {
  const secondaryApp =
    getApps().find((a) => a.name === 'SecondaryApp') ||
    initializeApp(firebaseConfig, 'SecondaryApp');
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    const uid = cred.user.uid;
    await signOut(secondaryAuth);
    return uid;
  } catch (err: unknown) {
    // If account already exists in Firebase, continue gracefully
    const code = (err as { code?: string })?.code;
    if (code === 'auth/email-already-in-use') {
      return '';
    }
    throw err;
  }
};

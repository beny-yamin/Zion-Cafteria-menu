import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { api } from '../lib/api.js';
import { AdminUser, UserRole } from '../types/index.js';

interface AuthContextType {
  user: AdminUser | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; role: UserRole }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const syncRes = await api.post('/auth/firebase-sync', {
            idToken,
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email?.split('@')[0],
          });
          if (syncRes.data.success) {
            localStorage.setItem('token', syncRes.data.token);
            localStorage.setItem('user', JSON.stringify(syncRes.data.user));
            setUser(syncRes.data.user);
          }
        } catch {
          // Token sync fallback to existing stored user
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; role: UserRole }> => {
    let syncedUser: AdminUser | null = null;
    let token = '';

    // 1. Try Firebase Authentication first
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await cred.user.getIdToken();
      const syncRes = await api.post('/auth/firebase-sync', {
        idToken,
        email: cred.user.email,
        name: cred.user.displayName || email.split('@')[0],
      });
      if (syncRes.data.success) {
        token = syncRes.data.token;
        syncedUser = syncRes.data.user;
      }
    } catch {
      // 2. Fallback to MongoDB direct authentication if Firebase throws
      const res = await api.post('/auth/login', { email, password: pass });
      if (res.data.success) {
        token = res.data.token;
        syncedUser = res.data.user;
      }
    }

    if (!syncedUser || !token) {
      throw new Error('Authentication failed. Please verify credentials.');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(syncedUser));
    setUser(syncedUser);
    return { success: true, role: syncedUser.role };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

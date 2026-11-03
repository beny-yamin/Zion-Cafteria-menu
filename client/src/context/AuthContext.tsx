import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { api } from '../lib/api.js';
import { AdminUser, UserRole } from '../types/index.js';

interface AuthContextType {
  user: AdminUser | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; role: UserRole }>;
  register: (name: string, email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; role: UserRole }>;
  demoLogin: (role: UserRole) => Promise<{ success: boolean; role: UserRole }>;
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
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const r = await api.post('/auth/firebase-sync', { idToken, email: fbUser.email, name: fbUser.displayName || fbUser.email?.split('@')[0] });
          if (r.data.success) { localStorage.setItem('token', r.data.token); localStorage.setItem('user', JSON.stringify(r.data.user)); setUser(r.data.user); }
        } catch { /* Fallback */ }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; role: UserRole }> => {
    let syncedUser: AdminUser | null = null;
    let token = '';
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await cred.user.getIdToken();
      const r = await api.post('/auth/firebase-sync', { idToken, email: cred.user.email, name: cred.user.displayName || email.split('@')[0] });
      if (r.data.success) { token = r.data.token; syncedUser = r.data.user; }
    } catch {
      const r = await api.post('/auth/login', { email, password: pass });
      if (r.data.success) { token = r.data.token; syncedUser = r.data.user; }
    }
    if (!syncedUser || !token) throw new Error('Authentication failed. Check credentials.');
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(syncedUser));
    setUser(syncedUser);
    return { success: true, role: syncedUser.role };
  };

  const register = async (name: string, email: string, pass: string, role: UserRole = 'Staff') => {
    try {
      const res = await api.post('/auth/register', { name, email, password: pass, role });
      if (!res.data.success || !res.data.user) throw new Error(res.data.message || 'Registration failed.');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true, role: res.data.user.role };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (axiosErr.response?.status === 409) {
        try { return await login(email, pass); } catch {
          throw new Error(axiosErr.response?.data?.message || 'Account already exists. Please sign in.');
        }
      }
      throw new Error(axiosErr.response?.data?.message || axiosErr.message || 'Registration failed.');
    }
  };

  const demoLogin = async (role: UserRole) => {
    const res = await api.post('/auth/demo-login', { role });
    if (!res.data.success || !res.data.user) throw new Error('Could not launch demo session.');
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return { success: true, role: res.data.user.role };
  };

  const logout = async () => {
    try { await firebaseSignOut(auth); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Coffee, ArrowRight } from 'lucide-react';
import { api } from '../lib/api.js';

export const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        if (res.data.user.role === 'Owner') {
          navigate('/owner');
        } else {
          navigate('/kitchen');
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-xl border border-amber-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-600 rounded-2xl text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Coffee className="w-7 h-7" />
          </div>
          <h2 className="font-black text-xl text-gray-900 tracking-tight">Staff Portal</h2>
          <p className="text-xs text-gray-500 mt-1">Kitchen & Administration Access</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1.5">Staff Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. owner@cafe.com"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1.5">Password</label>
            <div className="relative">
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full touch-target py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50 mt-6"
          >
            <span>{isLoading ? 'Signing In...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">Default Owner seed: <code className="font-mono text-amber-800">owner@cafe.com</code> / <code className="font-mono text-amber-800">admin1234</code></p>
        </div>
      </div>
    </div>
  );
};

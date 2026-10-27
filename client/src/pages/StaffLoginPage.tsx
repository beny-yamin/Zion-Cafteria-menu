import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Coffee, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

const DEMO_USERS = [
  { label: 'Owner', email: 'owner@cafe.com', pass: 'owner1234', color: 'bg-purple-100 text-purple-900 border-purple-200' },
  { label: 'Kitchen', email: 'kitchen@cafe.com', pass: 'kitchen1234', color: 'bg-orange-100 text-orange-900 border-orange-200' },
  { label: 'Floor Staff', email: 'staff@cafe.com', pass: 'staff1234', color: 'bg-blue-100 text-blue-900 border-blue-200' },
];

export const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.role === 'Owner') navigate('/owner');
      else if (res.role === 'KitchenStaff') navigate('/kitchen');
      else navigate('/staff');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-xl border border-amber-100">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-amber-600 rounded-2xl text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <Coffee className="w-7 h-7" />
          </div>
          <h2 className="font-black text-xl text-gray-900">Cafe Portal Login</h2>
          <p className="text-xs text-gray-500">Firebase & Role-Based Access Control</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Email Address</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@cafe.com" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white" />
          </div>
          <div>
            <label className="font-bold text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white" />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full touch-target py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 mt-2">
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5 mr-1 text-amber-600" />
            <span>Click to fill test credentials:</span>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {DEMO_USERS.map((demo) => (
              <button key={demo.label} type="button" onClick={() => fillDemo(demo.email, demo.pass)} className={`touch-target py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-colors ${demo.color}`}>
                {demo.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => navigate('/menu?table=1')} className="w-full mt-3 text-center text-xs text-amber-700 font-semibold hover:underline">
            Or continue as frictionless table guest &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

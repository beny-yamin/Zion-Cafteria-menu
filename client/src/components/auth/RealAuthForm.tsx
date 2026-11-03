import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Shield, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

export const RealAuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (userRole: UserRole) => {
    if (userRole === 'Owner') navigate('/owner');
    else if (userRole === 'KitchenStaff') navigate('/kitchen');
    else navigate('/staff');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = mode === 'login' ? await login(email, password) : await register(name, email, password, role);
      redirectByRole(res.role);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Authentication error.';
      setErrorMsg(msg);
      if (msg.toLowerCase().includes('already exists')) setMode('login');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestCustomer = async () => {
    if (user) await logout();
    navigate('/menu?table=1');
  };

  return (
    <div className="bg-cafe-deep/70 backdrop-blur-md border border-cafe-border/25 rounded-3xl p-6 shadow-2xl w-full transition-colors">
      <div className="mb-4">
        <h3 className="font-bold text-[#FFF4E6] text-base tracking-wide">Secure Staff Access</h3>
        <p className="text-xs text-[#C5B49F]">Access the digital menu directly as a guest, or sign in to staff dashboards.</p>
      </div>

      <button type="button" onClick={handleGuestCustomer} className="w-full touch-target min-h-[44px] py-3 px-4 bg-cafe-deep hover:bg-cafe-espresso text-[#FFF4E6] font-bold rounded-2xl flex items-center justify-between border border-cafe-amber/60 hover:border-cafe-amber shadow-[0_0_15px_rgba(233,149,36,0.15)] transition-all mb-4">
        <span className="flex items-center space-x-2.5 text-xs"><Smartphone className="w-4 h-4 text-cafe-amber" /><span className="tracking-wide">Customer Access (No Login Required)</span></span>
        <ArrowRight className="w-4 h-4 text-cafe-amber" />
      </button>

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cafe-border/20" /></div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="px-2.5 py-0.5 bg-cafe-deep backdrop-blur-sm text-[#C5B49F] font-bold rounded-full border border-cafe-border/20">Or Staff Sign In / Sign Up</span>
        </div>
      </div>

      <div className="flex bg-cafe-espresso/90 p-1 rounded-xl mb-3 text-xs border border-cafe-border/20">
        <button type="button" onClick={() => { setMode('login'); setErrorMsg(''); }} className={`flex-1 touch-target min-h-[38px] py-1.5 rounded-lg transition-all ${mode === 'login' ? 'bg-cafe-amber text-white font-bold shadow-sm' : 'text-[#C5B49F] hover:text-[#FFF4E6] font-bold'}`}>Sign In</button>
        <button type="button" onClick={() => { setMode('register'); setErrorMsg(''); }} className={`flex-1 touch-target min-h-[38px] py-1.5 rounded-lg transition-all ${mode === 'register' ? 'bg-cafe-amber text-white font-bold shadow-sm' : 'text-[#C5B49F] hover:text-[#FFF4E6] font-bold'}`}>Create Real Account</button>
      </div>

      {errorMsg && <div className="mb-3 p-2.5 bg-[#4B3024] border border-[#4B3024] rounded-xl text-xs text-[#FFF4E6] text-center font-bold shadow-sm">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
        {mode === 'register' && (
          <div>
            <label className="font-bold text-[#FFF4E6] block mb-1">Full Name</label>
            <div className="relative"><input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Smith" className="w-full px-3.5 py-2.5 bg-cafe-espresso/80 border border-cafe-border/25 focus:border-cafe-amber rounded-xl text-[#FFF4E6] placeholder-[#C5B49F]" /><User className="w-4 h-4 text-[#C5B49F] absolute right-3.5 top-1/2 -translate-y-1/2" /></div>
          </div>
        )}
        <div>
          <label className="font-bold text-[#FFF4E6] block mb-1">Email Address</label>
          <div className="relative"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@cafe.com" className="w-full px-3.5 py-2.5 bg-cafe-espresso/80 border border-cafe-border/25 focus:border-cafe-amber rounded-xl text-[#FFF4E6] placeholder-[#C5B49F]" /><Mail className="w-4 h-4 text-[#C5B49F] absolute right-3.5 top-1/2 -translate-y-1/2" /></div>
        </div>
        <div>
          <label className="font-bold text-[#FFF4E6] block mb-1">Password</label>
          <div className="relative"><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-cafe-espresso/80 border border-cafe-border/25 focus:border-cafe-amber rounded-xl text-[#FFF4E6] placeholder-[#C5B49F]" /><Lock className="w-4 h-4 text-[#C5B49F] absolute right-3.5 top-1/2 -translate-y-1/2" /></div>
        </div>
        {mode === 'register' && (
          <div>
            <label className="font-bold text-[#FFF4E6] block mb-1">Assigned Role</label>
            <div className="relative"><select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3.5 py-2.5 bg-cafe-espresso border border-cafe-border/25 focus:border-cafe-amber rounded-xl text-[#FFF4E6] font-bold"><option value="Staff">Floor Staff</option><option value="KitchenStaff">Kitchen Staff</option><option value="Owner">Cafe Owner / Admin</option></select><Shield className="w-4 h-4 text-[#C5B49F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full touch-target min-h-[44px] py-3 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg border border-cafe-amber/50 transition-all disabled:opacity-50 mt-3">
          <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

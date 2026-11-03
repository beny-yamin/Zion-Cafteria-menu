import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { createStaffFirebaseAuth } from '../../config/firebase.js';
import { UserRole } from '../../types/index.js';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffCreated: () => void;
}

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({ isOpen, onClose, onStaffCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      let firebaseUid = '';
      try {
        firebaseUid = await createStaffFirebaseAuth(email, password);
      } catch { /* Continue if offline */ }

      await api.post('/auth/users', { name, email, password, role, firebaseUid });
      onStaffCreated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create user account.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cafe-deep/50 backdrop-blur-sm">
      <div className="bg-cafe-card text-cafe-text rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-cafe-border transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-cafe-border">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-cafe-amber" />
            <h3 className="font-bold text-sm text-cafe-text">Add New Team Member</h3>
          </div>
          <button onClick={onClose} className="touch-target w-9 h-9 rounded-full flex items-center justify-center text-cafe-muted hover:bg-cafe-cream">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && <div className="mt-3 p-2.5 bg-[#4B3024] border border-[#4B3024] text-[#FFF4E6] text-xs rounded-xl font-bold shadow-sm">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          <div>
            <label className="font-bold text-cafe-text block mb-1">Full Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Smith" className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl font-medium focus:outline-none focus:border-cafe-amber" />
          </div>
          <div>
            <label className="font-bold text-cafe-text block mb-1">Email Address</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@cafe.com" className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl font-medium focus:outline-none focus:border-cafe-amber" />
          </div>
          <div>
            <label className="font-bold text-cafe-text block mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full px-3 py-2 border border-cafe-border bg-cafe-cream text-cafe-text rounded-xl font-medium focus:outline-none focus:border-cafe-amber" />
          </div>
          <div>
            <label className="font-bold text-cafe-text block mb-1">System Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 border border-cafe-border rounded-xl bg-cafe-cream text-cafe-text font-bold focus:outline-none focus:border-cafe-amber">
              <option value="KitchenStaff">Kitchen Staff (KDS Screen & Stock)</option>
              <option value="Staff">Floor Staff (Table Overview & Orders)</option>
              <option value="Owner">Co-Owner (Full Admin Access)</option>
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full touch-target min-h-[44px] py-3 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-bold rounded-xl mt-4 shadow-sm transition-colors disabled:opacity-50">
            {isSubmitting ? 'Creating Firebase Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

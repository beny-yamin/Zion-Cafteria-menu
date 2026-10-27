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
      // 1. Create account in Firebase Auth using secondary app instance
      let firebaseUid = '';
      try {
        firebaseUid = await createStaffFirebaseAuth(email, password);
      } catch {
        // Continue if offline or email exists
      }

      // 2. Persist account and role in MongoDB
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-gray-900">Add New Team Member</h3>
          </div>
          <button onClick={onClose} className="touch-target w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && <div className="mt-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Smith" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Email Address</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@cafe.com" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">System Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium">
              <option value="KitchenStaff">Kitchen Staff (KDS Screen & Stock)</option>
              <option value="Staff">Floor Staff (Table Overview & Assisted Orders)</option>
              <option value="Owner">Co-Owner (Full Admin Access)</option>
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full touch-target py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl mt-4 shadow-sm transition-colors disabled:opacity-50">
            {isSubmitting ? 'Creating Firebase Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

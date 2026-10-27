import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, KeyRound, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { AdminUser, UserRole } from '../../types/index.js';
import { CreateStaffModal } from './CreateStaffModal.js';

const ROLE_COLORS: Record<UserRole, string> = {
  Owner: 'bg-purple-100 text-purple-800 border-purple-200',
  KitchenStaff: 'bg-orange-100 text-orange-800 border-orange-200',
  Staff: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const StaffManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = () => {
    api.get('/auth/users').then((res) => {
      if (res.data.success) setUsers(res.data.users);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPass = window.prompt('Enter new password (min 6 characters):');
    if (!newPass || newPass.length < 6) return;
    try {
      await api.patch(`/auth/users/${userId}/password`, { newPassword: newPass });
      alert('Password updated successfully.');
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this staff account?')) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('User deletion failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Team & Role-Based Access</h3>
          <p className="text-xs text-gray-500">Create team accounts and grant dashboard permissions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="touch-target px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Account</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const id = u.id || u._id || '';
                return (
                  <tr key={id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-gray-900">{u.name}</td>
                    <td className="px-4 py-3.5 text-gray-600 font-mono">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(id, e.target.value as UserRole)}
                        className={`px-2 py-1 rounded-lg border font-bold text-[11px] ${ROLE_COLORS[u.role]}`}
                      >
                        <option value="Owner">Owner</option>
                        <option value="KitchenStaff">KitchenStaff</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleResetPassword(id)}
                        className="touch-target px-2.5 py-1 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg inline-flex items-center space-x-1"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                      {u.email !== 'owner@cafe.com' && (
                        <button
                          onClick={() => handleDelete(id)}
                          className="touch-target p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center"
                          title="Remove user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CreateStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStaffCreated={fetchUsers} />
    </div>
  );
};

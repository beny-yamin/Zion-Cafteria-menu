import React, { useState, useEffect } from 'react';
import { UserPlus, KeyRound, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { AdminUser, UserRole } from '../../types/index.js';
import { CreateStaffModal } from './CreateStaffModal.js';

const ROLE_COLORS: Record<UserRole, string> = {
  Owner: 'bg-purple-100 text-purple-800 border-purple-200',
  KitchenStaff: 'bg-orange-100 text-orange-800 border-orange-200',
  Staff: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const StaffManager: React.FC = () => {
  const navigate = useNavigate();
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
    await api.patch(`/auth/users/${userId}/role`, { role: newRole });
    fetchUsers();
  };

  const handleResetPassword = async (userId: string) => {
    const newPass = window.prompt('Enter new password (min 6 characters):');
    if (!newPass || newPass.length < 6) return;
    await api.patch(`/auth/users/${userId}/password`, { newPassword: newPass });
    alert('Password updated.');
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Delete this account?')) return;
    await api.delete(`/auth/users/${userId}`);
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Team Accounts (Kitchen & Staff)</h3>
          <p className="text-xs text-gray-500">Create and oversee team member accounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="touch-target px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff / Kitchen</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const id = u.id || u._id || '';
              return (
                <tr key={id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-[11px]">{u.email}</td>
                  <td className="px-3 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(id, e.target.value as UserRole)}
                      className={`px-2 py-0.5 rounded-lg border font-bold text-[11px] ${ROLE_COLORS[u.role]}`}
                    >
                      <option value="Owner">Owner</option>
                      <option value="KitchenStaff">KitchenStaff</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {u.role === 'KitchenStaff' && (
                      <button
                        onClick={() => navigate('/kitchen')}
                        className="touch-target px-2 py-1 text-orange-700 hover:bg-orange-50 rounded-lg inline-flex items-center space-x-1"
                        title="Open Kitchen Display"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>KDS</span>
                      </button>
                    )}
                    {u.role === 'Staff' && (
                      <button
                        onClick={() => navigate('/staff')}
                        className="touch-target px-2 py-1 text-blue-700 hover:bg-blue-50 rounded-lg inline-flex items-center space-x-1"
                        title="Open Staff Console"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Console</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleResetPassword(id)}
                      className="touch-target p-1 text-gray-400 hover:text-amber-600 rounded-lg inline-flex items-center"
                      title="Reset Password"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    {u.email !== 'owner@cafe.com' && (
                      <button
                        onClick={() => handleDelete(id)}
                        className="touch-target p-1 text-gray-400 hover:text-red-600 rounded-lg inline-flex items-center"
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

      <CreateStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStaffCreated={fetchUsers} />
    </div>
  );
};

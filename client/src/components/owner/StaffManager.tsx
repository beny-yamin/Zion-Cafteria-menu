import React, { useState, useEffect } from 'react';
import { UserPlus, KeyRound, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { AdminUser, UserRole } from '../../types/index.js';
import { CreateStaffModal } from './CreateStaffModal.js';

export const StaffManager: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = () => {
    api.get('/auth/users').then((res) => { if (res.data.success) setUsers(res.data.users); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole });
    } catch (err: any) { alert(err.response?.data?.message || 'Action blocked.'); }
    fetchUsers();
  };

  const handleResetPassword = async (userId: string) => {
    const newPass = window.prompt('Enter new password (min 6 characters):');
    if (!newPass || newPass.length < 6) return;
    try {
      await api.patch(`/auth/users/${userId}/password`, { newPassword: newPass });
      alert('Password updated.');
    } catch (err: any) { alert(err.response?.data?.message || 'Action blocked.'); }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      await api.delete(`/auth/users/${userId}`);
    } catch (err: any) { alert(err.response?.data?.message || 'Action blocked.'); }
    fetchUsers();
  };

  return (
    <div className="space-y-4 transition-colors">
      <div className="bg-cafe-card rounded-2xl border border-cafe-border p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-cafe-text text-sm">Team Accounts (Kitchen & Staff)</h3>
          <p className="text-xs text-cafe-muted">Create and oversee team member accounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="touch-target px-3 py-1.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff / Kitchen</span>
        </button>
      </div>

      <div className="bg-cafe-card rounded-2xl border border-cafe-border shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cafe-cream border-b border-cafe-border text-cafe-muted uppercase tracking-wider font-bold">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cafe-border/50">
            {users.map((u) => {
              const id = u.id || u._id || '';
              return (
                <tr key={id} className="hover:bg-cafe-cream/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-cafe-text">{u.name}</td>
                  <td className="px-4 py-3 text-cafe-muted font-mono text-[11px]">{u.email}</td>
                  <td className="px-3 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(id, e.target.value as UserRole)}
                      className="px-2 py-0.5 rounded-lg border border-cafe-border bg-cafe-cream text-cafe-text font-bold text-[11px]"
                    >
                      <option value="Owner">Owner</option>
                      <option value="KitchenStaff">KitchenStaff</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {u.role === 'KitchenStaff' && (
                      <button onClick={() => navigate('/kitchen')} className="touch-target px-2 py-1 text-cafe-amber hover:bg-cafe-cream rounded-lg inline-flex items-center space-x-1 font-bold">
                        <ExternalLink className="w-3 h-3" /><span>KDS</span>
                      </button>
                    )}
                    {u.role === 'Staff' && (
                      <button onClick={() => navigate('/staff')} className="touch-target px-2 py-1 text-cafe-accent hover:bg-cafe-cream rounded-lg inline-flex items-center space-x-1 font-bold">
                        <ExternalLink className="w-3 h-3" /><span>Console</span>
                      </button>
                    )}
                    <button onClick={() => handleResetPassword(id)} className="touch-target p-1 text-cafe-muted hover:text-cafe-amber rounded-lg inline-flex items-center" title="Reset Password">
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    {!u.isProtected && u.email !== 'owner@cafe.com' && (
                      <button onClick={() => handleDelete(id)} className="touch-target p-1 text-cafe-muted hover:text-[#4B3024] rounded-lg inline-flex items-center transition-colors" title="Remove user">
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

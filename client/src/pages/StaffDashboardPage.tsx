import React, { useState, useEffect } from 'react';
import { Users, RotateCcw, Utensils, LogOut, ArrowLeft, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Table } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { ThemeSwitcher } from '../components/layout/ThemeSwitcher.js';

export const StaffDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);

  const fetchTables = () => {
    api.get('/tables').then((res) => { if (res.data.success) setTables(res.data.tables); });
  };

  useEffect(() => { fetchTables(); }, []);

  const handleResetTable = async (tableNumber: number) => {
    try {
      await api.patch(`/tables/${tableNumber}/reset`);
      fetchTables();
    } catch (err) { console.error('Reset failed:', err); }
  };

  const occupiedCount = tables.filter((t) => t.isOccupied).length;

  return (
    <div className="min-h-screen bg-cafe-cream text-cafe-text flex flex-col transition-colors">
      <header className="bg-cafe-card border-b border-cafe-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cafe-deep text-cafe-amber border border-cafe-amber/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-cafe-text">Zion Floor Staff Console</h1>
            <p className="text-xs text-cafe-muted">Welcome, {user?.name || 'Staff'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          {user?.role === 'Owner' && (
            <button onClick={() => navigate('/owner')} className="touch-target px-3 py-1.5 bg-cafe-card hover:bg-cafe-cream text-cafe-text text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border">
              <ArrowLeft className="w-3.5 h-3.5 text-cafe-amber" /><span>Owner Central</span>
            </button>
          )}
          <button onClick={() => navigate('/menu?table=1')} className="touch-target px-3 py-1.5 bg-cafe-card hover:bg-cafe-cream text-cafe-text text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border" title="Open Customer Menu">
            <Smartphone className="w-3.5 h-3.5 text-cafe-amber" /><span>Customer Menu</span>
          </button>
          <button onClick={logout} className="touch-target w-9 h-9 rounded-xl border border-cafe-border text-cafe-muted hover:text-[#4B3024] hover:border-[#4B3024] hover:bg-cafe-cream flex items-center justify-center transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto p-6 space-y-6 flex-1">
        <div className="bg-cafe-card rounded-2xl border border-cafe-border p-5 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="font-bold text-cafe-text text-sm">Dining Room Status</h2>
            <p className="text-xs text-cafe-muted">{occupiedCount} of {tables.length} tables currently seated</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-cafe-deep text-cafe-amber rounded-full border border-cafe-amber/30">
            {occupiedCount} Occupied
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div
              key={table._id}
              className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all bg-cafe-card ${
                table.isOccupied ? 'border-cafe-amber ring-1 ring-cafe-amber/20' : 'border-cafe-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-cafe-text">Table #{table.tableNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    table.isOccupied ? 'bg-cafe-amber text-white' : 'bg-cafe-cream text-cafe-muted border border-cafe-border'
                  }`}>
                    {table.isOccupied ? 'Seated' : 'Available'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cafe-border/60 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/menu?table=${table.tableNumber}`)}
                  className="flex-1 touch-target py-2 bg-cafe-deep hover:bg-cafe-espresso text-cafe-cream text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition-colors"
                >
                  <Utensils className="w-3.5 h-3.5 text-cafe-amber" /><span>Take Order</span>
                </button>
                {table.isOccupied && (
                  <button
                    onClick={() => handleResetTable(table.tableNumber)}
                    className="touch-target w-9 h-9 rounded-xl border border-cafe-border bg-cafe-card text-cafe-muted hover:text-cafe-amber hover:bg-cafe-cream flex items-center justify-center"
                    title="Clear Table"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

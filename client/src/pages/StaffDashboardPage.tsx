import React, { useState, useEffect } from 'react';
import { Users, RotateCcw, Utensils, LogOut, ArrowLeft, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Table } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const StaffDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);

  const fetchTables = () => {
    api.get('/tables').then((res) => {
      if (res.data.success) setTables(res.data.tables);
    });
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleResetTable = async (tableNumber: number) => {
    try {
      await api.patch(`/tables/${tableNumber}/reset`);
      fetchTables();
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const occupiedCount = tables.filter((t) => t.isOccupied).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900">Floor Staff Console</h1>
            <p className="text-xs text-gray-500">Welcome, {user?.name || 'Staff'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user?.role === 'Owner' && (
            <button
              onClick={() => navigate('/owner')}
              className="touch-target px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl flex items-center space-x-1 border border-amber-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Owner Central</span>
            </button>
          )}
          <button
            onClick={() => navigate('/menu?table=1')}
            className="touch-target px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-emerald-200"
            title="Open Customer Menu"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer Menu</span>
          </button>
          <button
            onClick={logout}
            className="touch-target w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 flex items-center justify-center"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto p-6 space-y-6 flex-1">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Dining Room Status</h2>
            <p className="text-xs text-gray-500">{occupiedCount} of {tables.length} tables currently seated</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            {occupiedCount} Occupied
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div
              key={table._id}
              className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                table.isOccupied
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-gray-900">Table #{table.tableNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      table.isOccupied
                        ? 'bg-amber-600 text-white'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {table.isOccupied ? 'Seated' : 'Available'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/menu?table=${table.tableNumber}`)}
                  className="flex-1 touch-target py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Take Order</span>
                </button>
                {table.isOccupied && (
                  <button
                    onClick={() => handleResetTable(table.tableNumber)}
                    className="touch-target w-9 h-9 rounded-xl border border-amber-300 bg-white text-amber-800 hover:bg-amber-100 flex items-center justify-center"
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

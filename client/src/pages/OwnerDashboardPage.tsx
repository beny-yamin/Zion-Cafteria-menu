import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingBag, Clock, Plus, LogOut, LayoutDashboard, QrCode, Users, ChefHat, Utensils, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { AnalyticsData, Table } from '../types/index.js';
import { KpiCard } from '../components/cards/KpiCard.js';
import { SalesChart } from '../components/analytics/SalesChart.js';
import { TableQrManager } from '../components/tables/TableQrManager.js';
import { StaffManager } from '../components/owner/StaffManager.js';
import { MenuManagerModal } from '../components/forms/MenuManagerModal.js';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'tables' | 'staff'>('analytics');
  const [range, setRange] = useState<'today' | 'week' | 'month'>('today');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  const fetchAnalytics = useCallback(() => {
    api.get(`/analytics/dashboard?range=${range}`).then((res) => {
      if (res.data.success) setAnalytics(res.data);
    });
  }, [range]);

  const fetchTables = useCallback(() => {
    api.get('/tables').then((res) => {
      if (res.data.success) setTables(res.data.tables);
    });
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchTables();
  }, [fetchAnalytics, fetchTables]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="font-black text-xl text-gray-900 tracking-tight">Owner Central</h1>
          <nav className="flex space-x-1.5">
            <button onClick={() => setActiveTab('analytics')} className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 ${activeTab === 'analytics' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <button onClick={() => setActiveTab('tables')} className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 ${activeTab === 'tables' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <QrCode className="w-3.5 h-3.5" />
              <span>Tables & QR</span>
            </button>
            <button onClick={() => setActiveTab('staff')} className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 ${activeTab === 'staff' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Users className="w-3.5 h-3.5" />
              <span>Staff Management</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => navigate('/kitchen')} className="touch-target px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-orange-200" title="View Kitchen Display">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen</span>
          </button>
          <button onClick={() => navigate('/staff')} className="touch-target px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-blue-200" title="View Floor Staff Console">
            <Utensils className="w-3.5 h-3.5" />
            <span>Staff</span>
          </button>
          <button onClick={() => navigate('/menu?table=1')} className="touch-target px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-emerald-200" title="View Customer Menu">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer Menu</span>
          </button>
          <button onClick={() => setIsMenuModalOpen(true)} className="touch-target px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Item</span>
          </button>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="touch-target w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto p-6 flex-1 space-y-6">
        {activeTab === 'analytics' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-base">Key Performance Indicators</h2>
              <div className="flex bg-gray-200/80 p-1 rounded-xl">
                {(['today', 'week', 'month'] as const).map((r) => (
                  <button key={r} onClick={() => setRange(r)} className={`touch-target px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>{r}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard title="Total Revenue" value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} colorClass="bg-green-50 text-green-700" />
              <KpiCard title="Orders Served" value={analytics?.orderCount || 0} icon={ShoppingBag} colorClass="bg-blue-50 text-blue-700" />
              <KpiCard title="Average Kitchen Speed" value={`${analytics?.avgPrepTimeMinutes || 0} min`} icon={Clock} colorClass="bg-orange-50 text-orange-700" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Top Selling Menu Items</h3>
              <SalesChart data={analytics?.topSellingItems || []} />
            </div>
          </>
        )}
        {activeTab === 'tables' && <TableQrManager tables={tables} onTablesUpdated={fetchTables} />}
        {activeTab === 'staff' && <StaffManager />}
      </main>

      <MenuManagerModal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} onItemSaved={fetchAnalytics} />
    </div>
  );
};

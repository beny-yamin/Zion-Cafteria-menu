import React, { useState, useEffect, useCallback } from 'react';
import { Coins, ShoppingBag, Clock, Plus, LogOut, LayoutDashboard, QrCode, Users, ChefHat, Utensils, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { AnalyticsData, Table } from '../types/index.js';
import { KpiCard } from '../components/cards/KpiCard.js';
import { SalesChart } from '../components/analytics/SalesChart.js';
import { TableQrManager } from '../components/tables/TableQrManager.js';
import { StaffManager } from '../components/owner/StaffManager.js';
import { MenuManagerModal } from '../components/forms/MenuManagerModal.js';
import { ThemeSwitcher } from '../components/layout/ThemeSwitcher.js';

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
    <div className="min-h-screen bg-cafe-cream text-cafe-text flex flex-col transition-colors">
      <header className="bg-cafe-card border-b border-cafe-border px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <h1 className="font-black text-xl text-cafe-text tracking-tight">Zion Owner Central</h1>
          <nav className="flex space-x-1.5">
            <button onClick={() => setActiveTab('analytics')} className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 ${activeTab === 'analytics' ? 'bg-cafe-amber text-white shadow-sm' : 'text-cafe-muted hover:bg-cafe-cream hover:text-cafe-text'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <button onClick={() => setActiveTab('tables')} className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 ${activeTab === 'tables' ? 'bg-cafe-amber text-white shadow-sm' : 'text-cafe-muted hover:bg-cafe-cream hover:text-cafe-text'}`}>
              <QrCode className="w-3.5 h-3.5" />
              <span>Tables & QR</span>
            </button>
            <button onClick={() => setActiveTab('staff')} className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 ${activeTab === 'staff' ? 'bg-cafe-amber text-white shadow-sm' : 'text-cafe-muted hover:bg-cafe-cream hover:text-cafe-text'}`}>
              <Users className="w-3.5 h-3.5" />
              <span>Staff Management</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          <button onClick={() => navigate('/kitchen')} className="touch-target px-2.5 py-1.5 bg-cafe-card hover:bg-cafe-cream text-cafe-text text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border" title="View Kitchen Display">
            <ChefHat className="w-3.5 h-3.5 text-cafe-amber" />
            <span>Kitchen</span>
          </button>
          <button onClick={() => navigate('/staff')} className="touch-target px-2.5 py-1.5 bg-cafe-card hover:bg-cafe-cream text-cafe-text text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border" title="View Floor Staff Console">
            <Utensils className="w-3.5 h-3.5 text-cafe-deep" />
            <span>Staff</span>
          </button>
          <button onClick={() => navigate('/menu?table=1')} className="touch-target px-2.5 py-1.5 bg-cafe-card hover:bg-cafe-cream text-cafe-text text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border" title="View Customer Menu">
            <Smartphone className="w-3.5 h-3.5 text-cafe-amber" />
            <span>Menu</span>
          </button>
          <button onClick={() => setIsMenuModalOpen(true)} className="touch-target px-3 py-1.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Item</span>
          </button>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="touch-target w-9 h-9 rounded-xl border border-cafe-border text-cafe-muted hover:text-[#4B3024] hover:border-[#4B3024] flex items-center justify-center transition-colors" title="Log Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto p-6 flex-1 space-y-6">
        {activeTab === 'analytics' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-cafe-text text-base">Key Performance Indicators</h2>
              <div className="flex bg-cafe-border/50 p-1 rounded-xl">
                {(['today', 'week', 'month'] as const).map((r) => (
                  <button key={r} onClick={() => setRange(r)} className={`touch-target px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${range === r ? 'bg-cafe-card text-cafe-text shadow-sm' : 'text-cafe-muted'}`}>{r}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard title="Total Revenue" value={`${(analytics?.totalRevenue || 0).toFixed(0)} ETB`} icon={Coins} />
              <KpiCard title="Orders Served" value={analytics?.orderCount || 0} icon={ShoppingBag} />
              <KpiCard title="Average Kitchen Speed" value={`${analytics?.avgPrepTimeMinutes || 0} min`} icon={Clock} />
            </div>
            <div className="bg-cafe-card rounded-2xl border border-cafe-border p-6 shadow-sm">
              <h3 className="font-bold text-sm text-cafe-text mb-4">Top Selling Menu Items</h3>
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

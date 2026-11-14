import React, { useState, useEffect, useCallback } from 'react';
import { Coins, ShoppingBag, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { AnalyticsData, Table } from '../types/index.js';
import { KpiCard } from '../components/cards/KpiCard.js';
import { SalesChart } from '../components/analytics/SalesChart.js';
import { TableQrManager } from '../components/tables/TableQrManager.js';
import { StaffManager } from '../components/owner/StaffManager.js';
import { MenuManagerModal } from '../components/forms/MenuManagerModal.js';
import { OwnerHeader } from '../components/layout/OwnerHeader.js';
import { useAuth } from '../context/AuthContext.js';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const handleExit = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-cafe-cream text-cafe-text flex flex-col transition-colors">
      <OwnerHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewItem={() => setIsMenuModalOpen(true)}
        onExit={handleExit}
      />

      <main className="max-w-6xl w-full mx-auto p-3.5 sm:p-6 flex-1 space-y-5 sm:space-y-6">
        {activeTab === 'analytics' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <h2 className="font-bold text-cafe-text text-base">Performance</h2>
              <div className="flex bg-cafe-border/50 p-1 rounded-xl">
                {(['today', 'week', 'month'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`touch-target px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      range === r ? 'bg-cafe-card text-cafe-text shadow-sm' : 'text-cafe-muted'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <KpiCard title="Revenue" value={`${(analytics?.totalRevenue || 0).toFixed(0)} ETB`} icon={Coins} />
              <KpiCard title="Orders" value={analytics?.orderCount || 0} icon={ShoppingBag} />
              <KpiCard title="Speed" value={`${analytics?.avgPrepTimeMinutes || 0} min`} icon={Clock} />
            </div>
            <div className="bg-cafe-card rounded-2xl border border-cafe-border p-4 sm:p-6 shadow-sm overflow-hidden">
              <h3 className="font-bold text-sm text-cafe-text mb-4">Top Items</h3>
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

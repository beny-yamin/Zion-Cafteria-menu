import React, { useState, useEffect } from 'react';
import { ChefHat, Package, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Order, MenuItem, OrderStatus } from '../types/index.js';
import { useOrderSocket } from '../hooks/useOrderSocket.js';
import { OrderTicketCard } from '../components/cards/OrderTicketCard.js';
import { StockToggleDrawer } from '../components/kitchen/StockToggleDrawer.js';
import { ThemeSwitcher } from '../components/layout/ThemeSwitcher.js';
import { useAuth } from '../context/AuthContext.js';

export const KitchenDisplayPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<'all' | 'new' | 'prep' | 'ready'>('all');

  useEffect(() => {
    api.get('/orders/active').then((res) => { if (res.data.success) setOrders(res.data.orders.filter((o: Order) => o.paymentStatus === 'Paid')); });
    api.get('/menu').then((res) => { if (res.data.success) setMenuItems(res.data.items); });
  }, []);

  useOrderSocket({
    onNewOrder: (o) => { if (o.paymentStatus === 'Paid') setOrders((prev) => [o, ...prev.filter((x) => x._id !== o._id)]); },
    onStatusChange: ({ orderId, orderStatus }) => {
      setOrders((prev) => ['Completed', 'Served', 'Cancelled'].includes(orderStatus)
        ? prev.filter((o) => o._id !== orderId)
        : prev.map((o) => (o._id === orderId ? { ...o, orderStatus } : o)));
    },
  });

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { orderStatus: status });
      if (res.data.success) {
        setOrders((p) => ['Completed', 'Served', 'Cancelled'].includes(status) ? p.filter((o) => o._id !== orderId) : p.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)));
      }
    } catch (e) { console.error('Status update failed', e); }
  };

  const handleToggleStock = async (menuItemId: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/menu/${menuItemId}/stock`, { isAvailable: !currentStatus });
      if (res.data.success) setMenuItems((p) => p.map((i) => i._id === menuItemId ? { ...i, isAvailable: !currentStatus } : i));
    } catch (e) { console.error('Stock toggle failed', e); }
  };

  const handleExit = async () => {
    try { await logout(); } finally { navigate('/login', { replace: true }); }
  };

  const accepted = orders.filter((o) => ['Accepted', 'Received', 'Pending'].includes(o.orderStatus));
  const preparing = orders.filter((o) => ['Preparing', 'Cooking'].includes(o.orderStatus));
  const ready = orders.filter((o) => o.orderStatus === 'Ready');

  return (
    <div className="min-h-screen bg-cafe-espresso text-[#FFF4E6] flex flex-col transition-colors">
      <header className="sticky top-0 z-30 bg-cafe-deep border-b border-cafe-espresso px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-cafe-espresso border border-cafe-amber/40 rounded-lg flex items-center justify-center text-cafe-amber shrink-0">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-sm sm:text-lg tracking-wide uppercase text-[#FFF4E6] truncate">Kitchen</h1>
              <p className="text-[10px] sm:text-xs text-[#C5B49F] truncate">{orders.length} orders</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <ThemeSwitcher compact={true} />
            {user?.role === 'Owner' && (
              <button onClick={() => navigate('/owner')} className="touch-target px-2 sm:px-3 py-1.5 bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border/30 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /><span className="hidden xs:inline">Owner</span>
              </button>
            )}
            <button onClick={() => setIsStockDrawerOpen(true)} className="touch-target px-2.5 sm:px-3.5 py-1.5 bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border/30 transition-colors">
              <Package className="w-3.5 h-3.5 text-cafe-amber" /><span>Stock</span>
            </button>
            <button onClick={handleExit} className="touch-target w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cafe-espresso hover:bg-[#4B3024] text-[#C5B49F] hover:text-[#FFF4E6] flex items-center justify-center border border-cafe-border/20 transition-colors" title="Exit">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="md:hidden flex items-center space-x-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none">
          {(['all', 'new', 'prep', 'ready'] as const).map((s) => (
            <button key={s} onClick={() => setStageFilter(s)} className={`touch-target px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 capitalize ${stageFilter === s ? 'bg-cafe-amber text-white' : 'bg-cafe-espresso text-[#C5B49F]'}`}>
              {s === 'all' ? `All (${orders.length})` : s === 'new' ? `New (${accepted.length})` : s === 'prep' ? `Prep (${preparing.length})` : `Ready (${ready.length})`}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-3.5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto">
        {(stageFilter === 'all' || stageFilter === 'new') && (
          <div className="flex flex-col">
            <h2 className="font-bold text-xs sm:text-sm text-cafe-amber uppercase tracking-wider pb-2 mb-3 border-b-2 border-cafe-amber">New ({accepted.length})</h2>
            <div className="space-y-3.5 overflow-y-auto flex-1">{accepted.map((o) => <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />)}</div>
          </div>
        )}
        {(stageFilter === 'all' || stageFilter === 'prep') && (
          <div className="flex flex-col">
            <h2 className="font-bold text-xs sm:text-sm text-amber-500 uppercase tracking-wider pb-2 mb-3 border-b-2 border-amber-500">Preparing ({preparing.length})</h2>
            <div className="space-y-3.5 overflow-y-auto flex-1">{preparing.map((o) => <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />)}</div>
          </div>
        )}
        {(stageFilter === 'all' || stageFilter === 'ready') && (
          <div className="flex flex-col">
            <h2 className="font-bold text-xs sm:text-sm text-emerald-400 uppercase tracking-wider pb-2 mb-3 border-b-2 border-emerald-500">Ready ({ready.length})</h2>
            <div className="space-y-3.5 overflow-y-auto flex-1">{ready.map((o) => <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />)}</div>
          </div>
        )}
      </main>
      <StockToggleDrawer isOpen={isStockDrawerOpen} onClose={() => setIsStockDrawerOpen(false)} items={menuItems} onToggleStock={handleToggleStock} />
    </div>
  );
};

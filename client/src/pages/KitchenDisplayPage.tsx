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

  useEffect(() => {
    api.get('/orders/active').then((res) => {
      if (res.data.success) setOrders(res.data.orders.filter((o: Order) => o.paymentStatus === 'Paid'));
    });
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
        setOrders((prev) => ['Completed', 'Served', 'Cancelled'].includes(status)
          ? prev.filter((o) => o._id !== orderId)
          : prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)));
      }
    } catch (e) { console.error('Status update failed', e); }
  };

  const handleToggleStock = async (menuItemId: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/menu/${menuItemId}/stock`, { isAvailable: !currentStatus });
      if (res.data.success) setMenuItems((prev) => prev.map((i) => i._id === menuItemId ? { ...i, isAvailable: !currentStatus } : i));
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
      <header className="bg-cafe-deep border-b border-cafe-espresso px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-cafe-espresso border border-cafe-amber/40 rounded-lg flex items-center justify-center text-cafe-amber">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-wide uppercase text-[#FFF4E6]">Zion Kitchen Display</h1>
            <p className="text-xs text-[#C5B49F]">{orders.length} verified paid orders in queue</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          {user?.role === 'Owner' && (
            <button onClick={() => navigate('/owner')} className="touch-target px-3 py-2 bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-cafe-border/30 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /><span>Owner Central</span>
            </button>
          )}
          <button onClick={() => setIsStockDrawerOpen(true)} className="touch-target px-3.5 py-2 bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-cafe-border/30 transition-colors">
            <Package className="w-4 h-4 text-cafe-amber" /><span>Stock Switcher</span>
          </button>
          <button onClick={handleExit} className="touch-target w-10 h-10 rounded-xl bg-cafe-espresso hover:bg-[#4B3024] text-[#C5B49F] hover:text-[#FFF4E6] flex items-center justify-center border border-cafe-border/20 transition-colors" title="Exit / Log Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
        <div className="flex flex-col">
          <h2 className="font-bold text-sm text-cafe-amber uppercase tracking-wider pb-2 mb-3 border-b-2 border-cafe-amber">New Paid ({accepted.length})</h2>
          <div className="space-y-4 overflow-y-auto flex-1">{accepted.map((o) => <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />)}</div>
        </div>
        <div className="flex flex-col">
          <h2 className="font-bold text-sm text-amber-500 uppercase tracking-wider pb-2 mb-3 border-b-2 border-amber-500">Preparing ({preparing.length})</h2>
          <div className="space-y-4 overflow-y-auto flex-1">{preparing.map((o) => <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />)}</div>
        </div>
        <div className="flex flex-col">
          <h2 className="font-bold text-sm text-emerald-400 uppercase tracking-wider pb-2 mb-3 border-b-2 border-emerald-500">Ready for Pickup ({ready.length})</h2>
          <div className="space-y-4 overflow-y-auto flex-1">{ready.map((o) => <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />)}</div>
        </div>
      </main>
      <StockToggleDrawer isOpen={isStockDrawerOpen} onClose={() => setIsStockDrawerOpen(false)} items={menuItems} onToggleStock={handleToggleStock} />
    </div>
  );
};

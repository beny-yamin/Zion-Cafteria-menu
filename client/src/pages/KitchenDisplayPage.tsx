import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Order, MenuItem, OrderStatus } from '../types/index.js';
import { useOrderSocket } from '../hooks/useOrderSocket.js';
import { OrderTicketCard } from '../components/cards/OrderTicketCard.js';
import { StockToggleDrawer } from '../components/kitchen/StockToggleDrawer.js';
import { KitchenHeader } from '../components/kitchen/KitchenHeader.js';
import { useAuth } from '../context/AuthContext.js';

export const KitchenDisplayPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
      <KitchenHeader
        orderCount={orders.length}
        acceptedCount={accepted.length}
        preparingCount={preparing.length}
        readyCount={ready.length}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        onOpenStock={() => setIsStockDrawerOpen(true)}
        onExit={handleExit}
      />

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

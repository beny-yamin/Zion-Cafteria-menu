import React, { useState, useEffect } from 'react';
import { ChefHat, Package, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Order, OrderStatus, MenuItem } from '../types/index.js';
import { useOrderSocket } from '../hooks/useOrderSocket.js';
import { useAuth } from '../context/AuthContext.js';
import { OrderTicketCard } from '../components/cards/OrderTicketCard.js';
import { StockToggleDrawer } from '../components/kitchen/StockToggleDrawer.js';

export const KitchenDisplayPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);

  useEffect(() => {
    api.get('/orders/active').then((res) => {
      if (res.data.success) setOrders(res.data.orders);
    });
    api.get('/menu').then((res) => {
      if (res.data.success) setMenuItems(res.data.items);
    });
  }, []);

  useOrderSocket({
    isKitchen: true,
    onNewOrder: (newOrder) => {
      setOrders((prev) => [newOrder, ...prev.filter((o) => o._id !== newOrder._id)]);
    },
    onStatusChange: ({ orderId, orderStatus }) => {
      setOrders((prev) => {
        if (orderStatus === 'Served' || orderStatus === 'Cancelled') {
          return prev.filter((o) => o._id !== orderId);
        }
        return prev.map((o) => (o._id === orderId ? { ...o, orderStatus } : o));
      });
    },
  });

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { orderStatus: status });
      if (res.data.success) {
        setOrders((prev) => {
          if (status === 'Served' || status === 'Cancelled') {
            return prev.filter((o) => o._id !== orderId);
          }
          return prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o));
        });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleToggleStock = async (menuItemId: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/menu/${menuItemId}/stock`, { isAvailable: !currentStatus });
      if (res.data.success) {
        setMenuItems((prev) =>
          prev.map((i) => (i._id === menuItemId ? { ...i, isAvailable: !currentStatus } : i))
        );
      }
    } catch (err) {
      console.error('Error toggling stock:', err);
    }
  };

  const receivedOrders = orders.filter((o) => o.orderStatus === 'Received');
  const cookingOrders = orders.filter((o) => o.orderStatus === 'Cooking');
  const readyOrders = orders.filter((o) => o.orderStatus === 'Ready');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-wide uppercase">Kitchen Display System</h1>
            <p className="text-xs text-slate-400">{orders.length} active orders in queue</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user?.role === 'Owner' && (
            <button
              onClick={() => navigate('/owner')}
              className="touch-target px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-amber-500/40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Owner Central</span>
            </button>
          )}
          <button
            onClick={() => setIsStockDrawerOpen(true)}
            className="touch-target px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 border border-slate-700"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Stock Switcher</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="touch-target w-10 h-10 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-400 flex items-center justify-center"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-orange-500">
            <h2 className="font-bold text-sm text-gray-800 uppercase tracking-wider">New Orders ({receivedOrders.length})</h2>
          </div>
          <div className="space-y-4 overflow-y-auto flex-1">
            {receivedOrders.map((o) => (
              <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-amber-500">
            <h2 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Cooking ({cookingOrders.length})</h2>
          </div>
          <div className="space-y-4 overflow-y-auto flex-1">
            {cookingOrders.map((o) => (
              <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-green-500">
            <h2 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Ready for Service ({readyOrders.length})</h2>
          </div>
          <div className="space-y-4 overflow-y-auto flex-1">
            {readyOrders.map((o) => (
              <OrderTicketCard key={o._id} order={o} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        </div>
      </main>

      <StockToggleDrawer
        isOpen={isStockDrawerOpen}
        onClose={() => setIsStockDrawerOpen(false)}
        items={menuItems}
        onToggleStock={handleToggleStock}
      />
    </div>
  );
};

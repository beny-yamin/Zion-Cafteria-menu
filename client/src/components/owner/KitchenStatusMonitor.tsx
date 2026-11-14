import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Order } from '../../types/index.js';
import { useOrderSocket } from '../../hooks/useOrderSocket.js';

export const KitchenStatusMonitor: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActive = () => {
    api.get('/orders/active')
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.orders.filter((o: Order) => o.paymentStatus === 'Paid'));
        }
      })
      .catch((err) => console.error('Error fetching active kitchen orders', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 10000);
    return () => clearInterval(interval);
  }, []);

  useOrderSocket({
    onNewOrder: (o) => {
      if (o.paymentStatus === 'Paid') {
        setOrders((prev) => [o, ...prev.filter((x) => x._id !== o._id)]);
      }
    },
    onStatusChange: ({ orderId, orderStatus }) => {
      setOrders((prev) =>
        ['Completed', 'Served', 'Cancelled'].includes(orderStatus)
          ? prev.filter((o) => o._id !== orderId)
          : prev.map((o) => (o._id === orderId ? { ...o, orderStatus } : o))
      );
    },
  });

  const preparing = orders.filter((o) => ['Preparing', 'Cooking'].includes(o.orderStatus));
  const ready = orders.filter((o) => o.orderStatus === 'Ready');
  const pending = orders.filter((o) => ['Accepted', 'Received', 'Pending'].includes(o.orderStatus));

  return (
    <div className="space-y-4 transition-colors">
      <div className="bg-cafe-card rounded-2xl border border-cafe-border p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-cafe-text text-sm flex items-center space-x-2">
            <ChefHat className="w-4 h-4 text-cafe-amber" />
            <span>Kitchen Status Oversight</span>
          </h3>
          <p className="text-xs text-cafe-muted">Read-only live monitoring of kitchen preparation</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-xl bg-cafe-amber/15 text-cafe-amber text-xs font-bold border border-cafe-amber/30">
            {pending.length} New
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 text-xs font-bold border border-amber-500/30">
            {preparing.length} Cooking
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 text-xs font-bold border border-emerald-500/30">
            {ready.length} Ready
          </span>
        </div>
      </div>

      <div className="bg-cafe-cream/60 border border-cafe-border rounded-xl p-3 text-[11px] text-cafe-muted flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-cafe-amber shrink-0" />
        <span>Read-only view for business oversight. Order preparation statuses are managed exclusively by Kitchen staff.</span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-cafe-muted">Loading live orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-cafe-card rounded-2xl border border-cafe-border p-8 text-center text-xs text-cafe-muted shadow-sm">
          No active orders in kitchen right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {orders.map((order) => (
            <div key={order._id} className="bg-cafe-card rounded-2xl border border-cafe-border p-4 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-cafe-border/50 pb-2">
                <span className="font-bold text-sm text-cafe-text">Table #{order.tableNumber}</span>
                <span className="text-[10px] text-cafe-muted flex items-center font-mono">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-cafe-text">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-bold text-cafe-muted">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-cafe-border/50 flex items-center justify-between text-xs">
                <span className="text-cafe-muted text-[11px]">Total: {order.totalAmount} ETB</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                  order.orderStatus === 'Ready' ? 'bg-emerald-500/20 text-emerald-600' :
                  ['Preparing', 'Cooking'].includes(order.orderStatus) ? 'bg-amber-500/20 text-amber-600' : 'bg-cafe-amber/20 text-cafe-amber'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
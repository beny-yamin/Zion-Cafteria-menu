import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { MenuItem, MenuCategory, Order } from '../types/index.js';
import { useCart } from '../hooks/useCart.js';
import { useOrderSocket } from '../hooks/useOrderSocket.js';
import { CustomerHeader } from '../components/layout/CustomerHeader.js';
import { CategoryFilterBar } from '../components/menu/CategoryFilterBar.js';
import { MenuItemCard } from '../components/cards/MenuItemCard.js';
import { FloatingOrderNotification } from '../components/order/FloatingOrderNotification.js';
import { OrderTopPopPanel } from '../components/order/OrderTopPopPanel.js';
import { OrderStatusTracker } from '../components/tracker/OrderStatusTracker.js';

const CATEGORIES: Array<MenuCategory | 'All'> = ['All', 'Starters', 'Main Dishes', 'Desserts', 'Hot Drinks', 'Cold Drinks'];

export const CustomerMenuPage: React.FC = () => {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('m') || searchParams.get('token');
  const tableParam = searchParams.get('table');

  const [tableNumber, setTableNumber] = useState<number>(() => {
    if (tableParam) {
      const parsed = Math.max(0, Number(tableParam));
      try { sessionStorage.setItem('zion_table_num', String(parsed)); } catch (_) {}
      return parsed;
    }
    try {
      const saved = sessionStorage.getItem('zion_table_num');
      if (saved) return Number(saved);
    } catch (_) {}
    return 1;
  });

  useEffect(() => {
    if (!token) return;
    api.get(`/tables/resolve/${token}`).then((res) => {
      if (res.data?.success) {
        const resolved = Number(res.data.tableNumber);
        setTableNumber(resolved);
        try { sessionStorage.setItem('zion_table_num', String(resolved)); } catch (_) {}
      }
    }).catch(() => {});
  }, [token]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [tableStatus, setTableStatus] = useState<{ active: boolean; name?: string }>({ active: true });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const cart = useCart();

  useEffect(() => {
    api.get('/menu').then((res) => { if (res.data.success) setMenuItems(res.data.items); });
    api.get(`/tables/check/${tableNumber}`).then((res) => {
      if (res.data.success) setTableStatus({ active: res.data.active, name: res.data.name });
    });
    if (tableNumber > 0) {
      api.get(`/orders/table/${tableNumber}`).then((res) => {
        if (res.data.success && res.data.orders.length > 0) {
          const latest = res.data.orders[0];
          if (!['Completed', 'Served', 'Cancelled'].includes(latest.orderStatus)) setActiveOrder(latest);
        }
      });
    }
  }, [tableNumber]);

  useOrderSocket({
    tableNumber,
    onStockToggle: ({ menuItemId, isAvailable }) => setMenuItems((p) => p.map((i) => (i._id === menuItemId ? { ...i, isAvailable } : i))),
    onStatusChange: (payload) => {
      if (activeOrder && activeOrder._id === payload.orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, orderStatus: payload.orderStatus } : null));
      }
    },
  });

  const handleProceedToPayment = async (customerName?: string, customerEmail?: string) => {
    if (cart.items.length === 0 || isProcessingPayment) return;
    setIsProcessingPayment(true);
    try {
      const items = cart.items.map((i) => ({ menuItemId: i.menuItem._id, quantity: i.quantity, specialInstructions: i.specialInstructions }));
      const res = await api.post('/payments/initialize', { tableNumber, items, customerName, customerEmail });
      if (res.data.success && res.data.checkoutUrl) window.location.href = res.data.checkoutUrl;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-cafe-cream text-cafe-text pb-28 transition-colors duration-200">
      <CustomerHeader tableNumber={tableNumber} cartCount={cart.totalCount} onOpenCart={() => setIsOrderPanelOpen(true)} />
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {!tableStatus.active && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold text-center">
            Notice: Ordering is temporarily paused for this table. You may view the menu while waiting.
          </div>
        )}
        {activeOrder && <OrderStatusTracker order={activeOrder} />}
        <CategoryFilterBar categories={CATEGORIES} activeCategory={selectedCategory} onSelectCategory={setSelectedCategory} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => <MenuItemCard key={item._id} item={item} onAddToCart={(i) => cart.addItem(i, 1)} />)}
        </div>
      </main>
      <FloatingOrderNotification itemCount={cart.totalCount} totalAmount={cart.totalAmount} onOpenOrder={() => setIsOrderPanelOpen(true)} isOpen={isOrderPanelOpen} />
      <OrderTopPopPanel isOpen={isOrderPanelOpen} onClose={() => setIsOrderPanelOpen(false)} tableNumber={tableNumber} items={cart.items} subtotal={cart.subtotal} tax={cart.tax} totalAmount={cart.totalAmount} onUpdateQuantity={cart.updateQuantity} onRemove={cart.removeItem} onProceedToPayment={handleProceedToPayment} isProcessing={isProcessingPayment} />
    </div>
  );
};

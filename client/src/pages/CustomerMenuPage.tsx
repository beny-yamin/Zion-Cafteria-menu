import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { MenuItem, MenuCategory, Order } from '../types/index.js';
import { useCart } from '../hooks/useCart.js';
import { useOrderSocket } from '../hooks/useOrderSocket.js';
import { CustomerHeader } from '../components/layout/CustomerHeader.js';
import { CategoryFilterBar } from '../components/menu/CategoryFilterBar.js';
import { MenuItemCard } from '../components/cards/MenuItemCard.js';
import { CartDrawer } from '../components/drawers/CartDrawer.js';
import { OrderStatusTracker } from '../components/tracker/OrderStatusTracker.js';

const CATEGORIES: Array<MenuCategory | 'All'> = [
  'All',
  'Starters',
  'Main Dishes',
  'Desserts',
  'Hot Drinks',
  'Cold Drinks',
];

export const CustomerMenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = Math.max(1, Number(searchParams.get('table')) || 1);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const cart = useCart();

  useEffect(() => {
    api.get('/menu').then((res) => {
      if (res.data.success) setMenuItems(res.data.items);
    });

    api.get(`/orders/table/${tableNumber}`).then((res) => {
      if (res.data.success && res.data.orders.length > 0) {
        const latest = res.data.orders[0];
        if (latest.orderStatus !== 'Served' && latest.orderStatus !== 'Cancelled') {
          setActiveOrder(latest);
        }
      }
    });
  }, [tableNumber]);

  useOrderSocket({
    tableNumber,
    onStockToggle: ({ menuItemId, isAvailable }) => {
      setMenuItems((prev) =>
        prev.map((i) => (i._id === menuItemId ? { ...i, isAvailable } : i))
      );
    },
    onStatusChange: (payload) => {
      if (activeOrder && activeOrder._id === payload.orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, orderStatus: payload.orderStatus } : null));
      }
    },
  });

  const handleSubmitOrder = async () => {
    if (cart.items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        tableNumber,
        items: cart.items.map((i) => ({
          menuItemId: i.menuItem._id,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
        })),
      };
      const res = await api.post('/orders', payload);
      if (res.data.success) {
        setActiveOrder(res.data.order);
        cart.clearCart();
        setIsCartOpen(false);
      }
    } catch (err) {
      console.error('Order submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <CustomerHeader
        tableNumber={tableNumber}
        cartCount={cart.totalCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 pt-4">
        {activeOrder && <OrderStatusTracker order={activeOrder} />}

        <CategoryFilterBar
          categories={CATEGORIES}
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onAddToCart={(i) => cart.addItem(i, 1)}
            />
          ))}
        </div>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart.items}
        subtotal={cart.subtotal}
        tax={cart.tax}
        totalAmount={cart.totalAmount}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeItem}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

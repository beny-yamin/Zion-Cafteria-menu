import { useState, useEffect, useCallback, useMemo } from 'react';
import { get, set } from 'idb-keyval';
import { CartItem, MenuItem } from '../types/index.js';

const CART_STORAGE_KEY = 'cafe_digital_cart_v1';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted cart from IndexedDB on initial mount
  useEffect(() => {
    let mounted = true;
    get<CartItem[]>(CART_STORAGE_KEY)
      .then((saved) => {
        if (mounted && Array.isArray(saved)) {
          setItems(saved);
        }
      })
      .catch((err) => {
        console.warn('Could not read cart from IndexedDB:', err);
      })
      .finally(() => {
        if (mounted) setIsLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Write through to IndexedDB whenever items change (non-blocking <16ms)
  const persistItems = useCallback((updated: CartItem[]) => {
    set(CART_STORAGE_KEY, updated).catch((err) => {
      console.warn('Failed to persist cart to idb-keyval:', err);
    });
  }, []);

  const addItem = useCallback(
    (menuItem: MenuItem, quantity = 1, specialInstructions = '') => {
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.menuItem._id === menuItem._id);
        let updated: CartItem[];

        if (existingIndex > -1) {
          updated = [...prev];
          const existing = updated[existingIndex];
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + quantity,
            specialInstructions: specialInstructions || existing.specialInstructions,
          };
        } else {
          updated = [...prev, { menuItem, quantity, specialInstructions }];
        }

        persistItems(updated);
        return updated;
      });
    },
    [persistItems]
  );

  const updateQuantity = useCallback(
    (menuItemId: string, newQuantity: number) => {
      setItems((prev) => {
        let updated: CartItem[];
        if (newQuantity <= 0) {
          updated = prev.filter((i) => i.menuItem._id !== menuItemId);
        } else {
          updated = prev.map((i) =>
            i.menuItem._id === menuItemId ? { ...i, quantity: newQuantity } : i
          );
        }
        persistItems(updated);
        return updated;
      });
    },
    [persistItems]
  );

  const removeItem = useCallback(
    (menuItemId: string) => {
      setItems((prev) => {
        const updated = prev.filter((i) => i.menuItem._id !== menuItemId);
        persistItems(updated);
        return updated;
      });
    },
    [persistItems]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    persistItems([]);
  }, [persistItems]);

  const { subtotal, tax, totalAmount, totalCount } = useMemo(() => {
    const rawSubtotal = items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
    const sub = Math.round(rawSubtotal * 100) / 100;
    const computedTax = Math.round(sub * 0.15 * 100) / 100;
    const total = Math.round((sub + computedTax) * 100) / 100;
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: sub,
      tax: computedTax,
      totalAmount: total,
      totalCount: count,
    };
  }, [items]);

  return {
    items,
    isLoaded,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    totalAmount,
    totalCount,
  };
};

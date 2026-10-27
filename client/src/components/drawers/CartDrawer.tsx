import React from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../../types/index.js';
import { CartItemRow } from './CartItemRow.js';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  onUpdateQuantity: (menuItemId: string, qty: number) => void;
  onRemove: (menuItemId: string) => void;
  onSubmitOrder: () => void;
  isSubmitting: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  tax,
  totalAmount,
  onUpdateQuantity,
  onRemove,
  onSubmitOrder,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-gray-900">Your Table Order</h2>
            </div>
            <button
              onClick={onClose}
              className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-400">
                <ShoppingBag className="w-12 h-12 mb-3 stroke-1" />
                <p className="text-sm font-medium">Your cart is currently empty.</p>
                <p className="text-xs text-gray-400 mt-1">Explore our menu and add items to begin.</p>
              </div>
            ) : (
              items.map((item) => (
                <CartItemRow
                  key={item.menuItem._id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                />
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/80 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT & Service (15%)</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-amber-700 text-base">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onSubmitOrder}
                disabled={isSubmitting}
                className="w-full touch-target py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Submitting to Kitchen...</span>
                ) : (
                  <>
                    <span>Confirm Order (${totalAmount.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

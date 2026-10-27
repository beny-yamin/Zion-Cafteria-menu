import React from 'react';
import { ShoppingBag, Coffee, Clock } from 'lucide-react';

interface CustomerHeaderProps {
  tableNumber: number;
  cartCount: number;
  onOpenCart: () => void;
  avgPrepTime?: number;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  tableNumber,
  cartCount,
  onOpenCart,
  avgPrepTime = 12,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">Cafe Digital</h1>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Table #{tableNumber}
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                ~{avgPrepTime} min wait
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCart}
          aria-label="View Cart"
          className="relative touch-target w-12 h-12 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center hover:bg-amber-100 transition-colors focus:ring-2 focus:ring-amber-500"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

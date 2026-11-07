import React from 'react';
import { ShoppingBag, Coffee, Clock } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher.js';

interface CustomerHeaderProps {
  cafeName?: string;
  tableNumber: number;
  cartCount: number;
  onOpenCart: () => void;
  avgPrepTime?: number;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  cafeName = 'Zion Cafeteria',
  tableNumber,
  cartCount,
  onOpenCart,
  avgPrepTime = 12,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-cafe-card/95 backdrop-blur-md border-b border-cafe-border px-4 py-3 shadow-sm transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cafe-deep text-cafe-amber border border-cafe-amber/40 flex items-center justify-center shadow-md">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-cafe-text leading-tight tracking-tight">{cafeName}</h1>
            <div className="flex items-center space-x-2 text-xs text-cafe-muted">
              <span className="font-semibold text-cafe-amber bg-cafe-amber/10 px-2 py-0.5 rounded-full border border-cafe-amber/30">
                Digital Menu
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1 text-cafe-muted" />
                ~{avgPrepTime} min wait
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <ThemeSwitcher />
          <button
            onClick={onOpenCart}
            aria-label="View Cart"
            className="relative touch-target w-12 h-12 rounded-full bg-cafe-cream text-cafe-text border border-cafe-border flex items-center justify-center hover:bg-cafe-amber hover:text-white transition-all shadow-sm focus:ring-2 focus:ring-cafe-amber"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cafe-amber text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

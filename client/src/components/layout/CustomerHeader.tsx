import React from 'react';
import { ShoppingBag, Coffee, Clock } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher.js';
import { useAuth } from '../../context/AuthContext.js';

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
  const { user } = useAuth();
  const hasTopNav = Boolean(user?.isDemo);

  return (
    <header className="sticky top-0 z-40 bg-cafe-card/95 backdrop-blur-md border-b border-cafe-border px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cafe-deep text-cafe-amber border border-cafe-amber/40 flex items-center justify-center shadow-md shrink-0">
            <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-base sm:text-lg text-cafe-text leading-tight tracking-tight truncate">{cafeName}</h1>
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs text-cafe-muted">
              <span className="font-semibold text-cafe-amber bg-cafe-amber/10 px-2 py-0.5 rounded-full border border-cafe-amber/30 text-[11px] sm:text-xs">
                {tableNumber > 0 ? `T-${tableNumber}` : 'Menu'}
              </span>
              <span className="flex items-center text-[11px] sm:text-xs">
                <Clock className="w-3 h-3 mr-1 text-cafe-muted shrink-0" />
                ~{avgPrepTime}m
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {!hasTopNav && <ThemeSwitcher compact={true} />}
          <button
            onClick={onOpenCart}
            aria-label="Cart"
            className="relative touch-target w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cafe-cream text-cafe-text border border-cafe-border flex items-center justify-center hover:bg-cafe-amber hover:text-white transition-all shadow-sm focus:ring-2 focus:ring-cafe-amber"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cafe-amber text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

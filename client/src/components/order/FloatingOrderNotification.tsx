import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface FloatingOrderNotificationProps {
  itemCount: number;
  totalAmount: number;
  onOpenOrder: () => void;
  isOpen: boolean;
}

export const FloatingOrderNotification: React.FC<FloatingOrderNotificationProps> = ({
  itemCount,
  totalAmount,
  onOpenOrder,
  isOpen,
}) => {
  if (itemCount === 0 || isOpen) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:left-auto z-40 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300 w-[calc(100%-1.5rem)] sm:w-auto">
      <div className="bg-cafe-card/95 backdrop-blur-md border-2 border-cafe-amber/50 shadow-2xl rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 text-cafe-text">
        <div className="flex items-center space-x-2.5 sm:space-x-3 pl-0.5 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cafe-amber/15 text-cafe-amber flex items-center justify-center border border-cafe-amber/30 shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 bg-cafe-amber text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
              {itemCount}
            </span>
          </div>
          <div className="min-w-0 truncate">
            <p className="text-[11px] font-bold text-cafe-muted uppercase tracking-wider truncate">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
            <p className="text-xs sm:text-sm font-black text-cafe-text truncate">
              Total: <span className="text-cafe-amber">{totalAmount.toFixed(2)} ETB</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenOrder}
          className="touch-target min-h-[42px] px-4 sm:px-6 py-2 bg-cafe-amber hover:bg-cafe-amber-hover active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0"
          aria-label="Open Order Panel"
        >
          <span>Order</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

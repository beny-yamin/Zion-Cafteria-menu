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
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto z-40 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-cafe-card/95 backdrop-blur-md border-2 border-cafe-amber/50 shadow-2xl rounded-2xl p-3 flex items-center justify-between gap-3 text-cafe-text">
        <div className="flex items-center space-x-3 pl-1">
          <div className="relative w-10 h-10 rounded-xl bg-cafe-amber/15 text-cafe-amber flex items-center justify-center border border-cafe-amber/30">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-cafe-amber text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
              {itemCount}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-cafe-muted uppercase tracking-wider">
              {itemCount} {itemCount === 1 ? 'item selected' : 'items selected'}
            </p>
            <p className="text-sm font-black text-cafe-text">
              Total: <span className="text-cafe-amber">{totalAmount.toFixed(2)} ETB</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenOrder}
          className="touch-target min-h-[44px] px-6 py-2.5 bg-cafe-amber hover:bg-cafe-amber-hover active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-2"
          aria-label="Open Order Panel"
        >
          <span>Order</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '../../types/index.js';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (menuItemId: string, qty: number) => void;
  onRemove: (menuItemId: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="py-3 border-b border-cafe-border/50 flex items-center justify-between gap-3 transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-cafe-text truncate">{item.menuItem.name}</h4>
        <div className="text-xs text-cafe-amber font-black mt-0.5">
          ${(item.menuItem.price * item.quantity).toFixed(2)}
        </div>
        {item.specialInstructions && (
          <p className="text-[11px] text-cafe-muted italic mt-0.5 truncate">
            Note: {item.specialInstructions}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-cafe-border rounded-lg overflow-hidden bg-cafe-cream">
          <button
            onClick={() => onUpdateQuantity(item.menuItem._id, item.quantity - 1)}
            className="touch-target w-9 h-9 flex items-center justify-center text-cafe-text hover:bg-cafe-border/40 active:bg-cafe-border/60"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-cafe-text">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.menuItem._id, item.quantity + 1)}
            className="touch-target w-9 h-9 flex items-center justify-center text-cafe-text hover:bg-cafe-border/40 active:bg-cafe-border/60"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.menuItem._id)}
          className="touch-target w-9 h-9 flex items-center justify-center text-cafe-muted hover:text-[#4B3024] transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

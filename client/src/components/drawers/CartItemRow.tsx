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
    <div className="py-3 border-b border-gray-100 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">{item.menuItem.name}</h4>
        <div className="text-xs text-amber-700 font-semibold mt-0.5">
          ${(item.menuItem.price * item.quantity).toFixed(2)}
        </div>
        {item.specialInstructions && (
          <p className="text-[11px] text-gray-500 italic mt-0.5 truncate">
            Note: {item.specialInstructions}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <button
            onClick={() => onUpdateQuantity(item.menuItem._id, item.quantity - 1)}
            className="touch-target w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-semibold text-gray-800">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.menuItem._id, item.quantity + 1)}
            className="touch-target w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.menuItem._id)}
          className="touch-target w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-600"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

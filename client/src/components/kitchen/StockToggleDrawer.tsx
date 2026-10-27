import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { MenuItem } from '../../types/index.js';

interface StockToggleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  onToggleStock: (menuItemId: string, currentStatus: boolean) => void;
}

export const StockToggleDrawer: React.FC<StockToggleDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onToggleStock,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Kitchen Stock Switcher</h2>
              <p className="text-xs text-gray-400">Toggle sold-out items instantly</p>
            </div>
            <button
              onClick={onClose}
              className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{item.name}</h4>
                  <span className="text-xs text-gray-400">{item.category}</span>
                </div>
                <button
                  onClick={() => onToggleStock(item._id, item.isAvailable)}
                  className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                    item.isAvailable
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  {item.isAvailable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Out of Stock</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
      <div className="absolute inset-0 bg-cafe-deep/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cafe-card text-cafe-text shadow-2xl flex flex-col border-l border-cafe-border transition-colors">
          <div className="px-5 py-4 border-b border-cafe-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-cafe-text">Kitchen Stock Switcher</h2>
              <p className="text-xs text-cafe-muted">Toggle sold-out items instantly</p>
            </div>
            <button
              onClick={onClose}
              className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-cafe-muted hover:text-cafe-text hover:bg-cafe-cream"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-cafe-border/50">
            {items.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-cafe-text">{item.name}</h4>
                  <span className="text-xs text-cafe-muted font-semibold">{item.category}</span>
                </div>
                <button
                  onClick={() => onToggleStock(item._id, item.isAvailable)}
                  className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                    item.isAvailable
                      ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/30'
                      : 'bg-[#4B3024] text-[#FFF4E6] border border-[#4B3024] hover:bg-[#3A251B]'
                  }`}
                >
                  {item.isAvailable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-[#E8DCCB]" />
                      <span>Sold Out</span>
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

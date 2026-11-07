import React, { useState } from 'react';
import { X, CreditCard, ShoppingBag, ShieldCheck, Loader2 } from 'lucide-react';
import { CartItem } from '../../types/index.js';
import { CartItemRow } from '../drawers/CartItemRow.js';
import { OptionalCustomerFields } from './OptionalCustomerFields.js';

interface OrderTopPopPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  onUpdateQuantity: (menuItemId: string, qty: number) => void;
  onRemove: (menuItemId: string) => void;
  onProceedToPayment: (name?: string, email?: string) => Promise<void>;
  isProcessing: boolean;
}

export const OrderTopPopPanel: React.FC<OrderTopPopPanelProps> = ({
  isOpen,
  onClose,
  tableNumber,
  items,
  subtotal,
  tax,
  totalAmount,
  onUpdateQuantity,
  onRemove,
  onProceedToPayment,
  isProcessing,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handlePay = () => {
    onProceedToPayment(name.trim() || undefined, email.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cafe-deep/65 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-cafe-card text-cafe-text border-2 border-cafe-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-6 duration-300 mt-2 sm:mt-6 transition-colors">
        <div className="px-6 py-4 border-b border-cafe-border flex items-center justify-between bg-cafe-cream/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cafe-amber/15 text-cafe-amber flex items-center justify-center border border-cafe-amber/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-cafe-text">Review & Complete Order</h2>
              <p className="text-xs text-cafe-muted">
                {tableNumber > 0 ? `Serving Table #${tableNumber}` : 'General Cafeteria (Counter Pickup)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="touch-target w-9 h-9 rounded-full flex items-center justify-center text-cafe-muted hover:text-cafe-text hover:bg-cafe-cream"
            aria-label="Close order panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="max-h-64 overflow-y-auto divide-y divide-cafe-border/50 pr-1">
            {items.length === 0 ? (
              <p className="text-xs text-cafe-muted text-center py-6">Your cart is empty.</p>
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

          <div className="bg-cafe-cream/80 border border-cafe-border rounded-2xl p-4 space-y-1.5 text-xs text-cafe-muted">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-cafe-text">{subtotal.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>VAT & Service (15%):</span>
              <span className="font-bold text-cafe-text">{tax.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between text-sm font-black text-cafe-text pt-2 border-t border-cafe-border">
              <span>Pre-Payment Total:</span>
              <span className="text-cafe-amber text-base">{totalAmount.toFixed(2)} ETB</span>
            </div>
          </div>

          <OptionalCustomerFields
            name={name}
            email={email}
            onNameChange={setName}
            onEmailChange={setEmail}
            disabled={isProcessing}
          />

          <div className="pt-2 space-y-2.5">
            <button
              onClick={handlePay}
              disabled={isProcessing || items.length === 0}
              className="w-full touch-target min-h-[48px] py-3.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Chapa...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Payment ({totalAmount.toFixed(2)} ETB)</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-cafe-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chapa TEST MODE · Zero installation required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

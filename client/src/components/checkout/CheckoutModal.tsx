import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  totalAmount: number;
  onPayWithChapa: (customerName?: string, customerEmail?: string) => Promise<void>;
  isProcessing: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  totalAmount,
  onPayWithChapa,
  isProcessing,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPayWithChapa(name.trim() || undefined, email.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cafe-deep/60 backdrop-blur-sm">
      <div className="bg-cafe-card text-cafe-text border border-cafe-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-colors">
        <div className="px-5 py-4 border-b border-cafe-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-cafe-amber" />
            <h3 className="font-bold text-base text-cafe-text">Cafeteria Checkout</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="touch-target w-9 h-9 rounded-full flex items-center justify-center text-cafe-muted hover:text-cafe-text hover:bg-cafe-cream"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-cafe-cream/80 border border-cafe-border rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-cafe-muted font-semibold">Location / Service</p>
              <p className="text-sm font-black text-cafe-text">
                {tableNumber > 0 ? `Table #${tableNumber}` : 'General Cafeteria (Pickup)'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-cafe-muted font-semibold">Total to Pay</p>
              <p className="text-base font-black text-cafe-amber">{totalAmount.toFixed(2)} ETB</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-cafe-muted mb-1">
                Your Name <span className="text-[10px] text-cafe-muted/70 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abebe Bikila"
                className="w-full px-3 py-2 text-xs rounded-xl border border-cafe-border bg-cafe-cream text-cafe-text focus:outline-none focus:border-cafe-amber"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cafe-muted mb-1">
                Email Address <span className="text-[10px] text-cafe-muted/70 font-normal">(Optional, for receipt)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. abebe@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-cafe-border bg-cafe-cream text-cafe-text focus:outline-none focus:border-cafe-amber"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-cafe-muted bg-cafe-cream/40 p-2.5 rounded-lg border border-cafe-border/40">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Secure payment in <strong>TEST MODE</strong> powered by Chapa.</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full touch-target min-h-[44px] py-3.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to Chapa...</span>
              </>
            ) : (
              <span>Pay {totalAmount.toFixed(2)} ETB with Chapa</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

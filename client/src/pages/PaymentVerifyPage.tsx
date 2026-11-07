import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api.js';
import { Order } from '../types/index.js';

export const PaymentVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tx_ref = searchParams.get('tx_ref');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!tx_ref) {
      setError('Transaction reference not found.');
      setIsLoading(false);
      return;
    }

    api.get(`/payments/verify/${encodeURIComponent(tx_ref)}`)
      .then((res) => {
        if (res.data.success && res.data.verified) {
          setVerifiedOrder(res.data.order);
        } else {
          setError(res.data.message || 'Payment verification could not be confirmed.');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Payment could not be verified. Please contact staff.');
      })
      .finally(() => setIsLoading(false));
  }, [tx_ref]);

  return (
    <div className="min-h-screen bg-cafe-cream text-cafe-text flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cafe-card rounded-3xl border border-cafe-border p-6 shadow-xl text-center space-y-6">
        {isLoading && (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-cafe-amber animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-cafe-text">Verifying Payment with Chapa...</h2>
            <p className="text-xs text-cafe-muted">Please wait while your payment is securely confirmed.</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="py-6 space-y-4">
            <XCircle className="w-16 h-16 text-[#4B3024] mx-auto" />
            <h2 className="text-xl font-black text-cafe-text">Payment Not Completed</h2>
            <p className="text-xs text-cafe-muted px-4">{error}</p>
            <button
              onClick={() => navigate('/menu')}
              className="touch-target px-6 py-3 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
            >
              <span>Return to Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!isLoading && verifiedOrder && (
          <div className="py-4 space-y-5 animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-emerald-600 tracking-tight">✓ Payment Successful</h2>
              <p className="text-xs text-cafe-muted mt-1 font-medium">
                &ldquo;Your order has been sent to the cafeteria.&rdquo;
              </p>
            </div>

            <div className="bg-cafe-cream/80 border border-cafe-border rounded-2xl p-5 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-cafe-muted font-bold">Order Number</span>
                <span className="font-black text-cafe-text text-sm">#{verifiedOrder.orderNumber || '1234'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-cafe-muted font-bold">Location</span>
                <span className="font-bold text-cafe-text">
                  {verifiedOrder.tableNumber > 0 ? `Table ${verifiedOrder.tableNumber}` : 'General Cafeteria'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-cafe-border">
                <span className="text-cafe-muted font-bold">Total</span>
                <span className="font-black text-cafe-amber text-base">{verifiedOrder.totalAmount.toFixed(0)} ETB</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-cafe-muted font-bold">Status</span>
                <span className="bg-emerald-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  PAID
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(verifiedOrder.tableNumber > 0 ? `/menu?table=${verifiedOrder.tableNumber}` : '/menu')}
              className="w-full touch-target min-h-[44px] py-3.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Back to Cafeteria Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

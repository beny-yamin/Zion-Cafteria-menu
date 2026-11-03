import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ChefHat, Clock, Sparkles, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.js';

interface OrderStatusTrackerProps {
  order: Order;
  onDismiss?: () => void;
}

const STEPS: Array<{ key: OrderStatus; label: string; icon: React.ElementType }> = [
  { key: 'Received', label: 'Order Sent', icon: Clock },
  { key: 'Cooking', label: 'In Kitchen', icon: ChefHat },
  { key: 'Ready', label: 'Ready', icon: Sparkles },
  { key: 'Served', label: 'Served', icon: CheckCircle2 },
];

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ order }) => {
  useEffect(() => {
    if (order.orderStatus === 'Ready' || order.orderStatus === 'Served') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [order.orderStatus]);

  if (order.orderStatus === 'Cancelled') {
    return (
      <div className="bg-[#4B3024]/15 border border-[#4B3024]/40 rounded-2xl p-4 text-center my-4 transition-colors">
        <XCircle className="w-8 h-8 text-[#4B3024] mx-auto mb-2" />
        <h4 className="font-bold text-cafe-text text-sm">Order Cancelled</h4>
        <p className="text-xs text-cafe-muted mt-1">Please notify your server for assistance.</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="bg-cafe-card border border-cafe-border rounded-2xl p-4 shadow-sm my-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-cafe-border">
        <div>
          <span className="text-[11px] font-bold text-cafe-amber uppercase tracking-wider">Live Order Status</span>
          <h4 className="font-bold text-cafe-text text-sm">Order #{order._id.slice(-6).toUpperCase()}</h4>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-cafe-deep text-cafe-amber rounded-full border border-cafe-amber/30">
          Table {order.tableNumber}
        </span>
      </div>

      <div className="pt-4 grid grid-cols-4 gap-2 text-center">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-cafe-amber text-white ring-4 ring-cafe-amber/20 scale-105 shadow'
                    : isDone
                    ? 'bg-cafe-espresso text-cafe-amber'
                    : 'bg-cafe-cream text-cafe-muted border border-cafe-border'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[11px] mt-1.5 font-bold leading-tight ${isDone ? 'text-cafe-text' : 'text-cafe-muted'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

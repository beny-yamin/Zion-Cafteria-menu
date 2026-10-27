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
  { key: 'Cooking', label: 'In the Kitchen', icon: ChefHat },
  { key: 'Ready', label: 'Ready for You', icon: Sparkles },
  { key: 'Served', label: 'Enjoy your meal!', icon: CheckCircle2 },
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
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center my-4">
        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h4 className="font-bold text-red-900 text-sm">Order Cancelled</h4>
        <p className="text-xs text-red-700 mt-1">Please notify your server for assistance.</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm my-4">
      <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
        <div>
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Live Order Status</span>
          <h4 className="font-bold text-gray-900 text-sm">Order #{order._id.slice(-6).toUpperCase()}</h4>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-600 text-white rounded-full">
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
                    ? 'bg-amber-600 text-white ring-4 ring-amber-200 scale-105'
                    : isDone
                    ? 'bg-amber-700 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[11px] mt-1.5 font-medium leading-tight ${isDone ? 'text-amber-950 font-semibold' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

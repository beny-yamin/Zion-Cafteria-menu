import React from 'react';
import { Clock, Check, ChefHat, CheckCheck, X } from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.js';

interface OrderTicketCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderTicketCard: React.FC<OrderTicketCardProps> = ({ order, onUpdateStatus }) => {
  const timeFormatted = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-cafe-card rounded-2xl border border-cafe-border shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-all">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-cafe-border">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black bg-cafe-deep text-cafe-amber border border-cafe-amber/30 px-2.5 py-1 rounded-lg">
              T-{order.tableNumber}
            </span>
            <span className="text-xs font-semibold text-cafe-muted">#{order._id.slice(-5)}</span>
          </div>
          <span className="text-xs text-cafe-muted flex items-center font-semibold">
            <Clock className="w-3.5 h-3.5 mr-1 text-cafe-muted" />
            {timeFormatted}
          </span>
        </div>

        <div className="py-3 divide-y divide-cafe-border/40 max-h-56 overflow-y-auto">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2 flex items-start justify-between text-xs">
              <div>
                <span className="font-bold text-cafe-text mr-2">{item.quantity}x</span>
                <span className="text-cafe-text font-medium">{item.name}</span>
                {item.specialInstructions && (
                  <p className="text-[11px] text-cafe-amber font-bold mt-0.5">
                    * {item.specialInstructions}
                  </p>
                )}
              </div>
              <span className="text-cafe-muted font-mono font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-cafe-border flex items-center gap-2">
        {order.orderStatus === 'Received' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Cooking')}
            className="flex-1 touch-target py-2.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            <span>Start Cooking</span>
          </button>
        )}

        {order.orderStatus === 'Cooking' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Ready')}
            className="flex-1 touch-target py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Mark Ready</span>
          </button>
        )}

        {order.orderStatus === 'Ready' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Served')}
            className="flex-1 touch-target py-2.5 bg-cafe-deep hover:bg-cafe-espresso text-[#FFF4E6] font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-cafe-amber" />
            <span>Mark Served</span>
          </button>
        )}

        <button
          onClick={() => onUpdateStatus(order._id, 'Cancelled')}
          className="touch-target w-10 h-10 rounded-xl border border-cafe-border text-cafe-muted hover:text-[#4B3024] hover:bg-[#4B3024]/15 hover:border-[#4B3024] flex items-center justify-center transition-colors"
          title="Cancel Order"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

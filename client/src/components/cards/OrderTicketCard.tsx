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

  const isTable = order.tableNumber > 0;
  const isPreparing = order.orderStatus === 'Preparing' || order.orderStatus === 'Cooking';
  const isAccepted = order.orderStatus === 'Accepted' || order.orderStatus === 'Received' || order.orderStatus === 'Pending';
  const isReady = order.orderStatus === 'Ready';

  return (
    <div className="bg-cafe-card rounded-2xl border border-cafe-border shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-all">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-cafe-border">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black bg-cafe-deep text-cafe-amber border border-cafe-amber/30 px-2 py-1 rounded-lg">
              {isTable ? `T-${order.tableNumber}` : 'General'}
            </span>
            <span className="text-xs font-bold text-cafe-text">#{order.orderNumber || order._id.slice(-4)}</span>
            <span className="bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              {order.paymentStatus || 'PAID'}
            </span>
          </div>
          <span className="text-[11px] text-cafe-muted flex items-center font-semibold">
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
                  <p className="text-[11px] text-cafe-amber font-bold mt-0.5">* {item.specialInstructions}</p>
                )}
              </div>
              <span className="text-cafe-muted font-mono font-semibold">{(item.price * item.quantity).toFixed(0)} ETB</span>
            </div>
          ))}
        </div>

        <div className="py-2 border-t border-cafe-border/50 flex justify-between items-center text-xs">
          <span className="text-cafe-muted font-bold">Total Paid:</span>
          <span className="font-black text-cafe-amber">{order.totalAmount.toFixed(0)} ETB</span>
        </div>
      </div>

      <div className="pt-3 border-t border-cafe-border flex items-center gap-2">
        {isAccepted && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Preparing')}
            className="flex-1 touch-target py-2.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            <span>Start Preparing</span>
          </button>
        )}

        {isPreparing && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Ready')}
            className="flex-1 touch-target py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Mark Ready</span>
          </button>
        )}

        {isReady && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Completed')}
            className="flex-1 touch-target py-2.5 bg-cafe-deep hover:bg-cafe-espresso text-[#FFF4E6] font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-cafe-amber" />
            <span>Mark Completed</span>
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

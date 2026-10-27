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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black bg-amber-600 text-white px-2.5 py-1 rounded-lg">
              T-{order.tableNumber}
            </span>
            <span className="text-xs font-semibold text-gray-500">#{order._id.slice(-5)}</span>
          </div>
          <span className="text-xs text-gray-400 flex items-center font-medium">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {timeFormatted}
          </span>
        </div>

        <div className="py-3 divide-y divide-gray-50 max-h-56 overflow-y-auto">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2 flex items-start justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900 mr-2">{item.quantity}x</span>
                <span className="text-gray-800 font-medium">{item.name}</span>
                {item.specialInstructions && (
                  <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                    * {item.specialInstructions}
                  </p>
                )}
              </div>
              <span className="text-gray-400 font-mono">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
        {order.orderStatus === 'Received' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Cooking')}
            className="flex-1 touch-target py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            <span>Start Cooking</span>
          </button>
        )}

        {order.orderStatus === 'Cooking' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Ready')}
            className="flex-1 touch-target py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Mark Ready</span>
          </button>
        )}

        {order.orderStatus === 'Ready' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'Served')}
            className="flex-1 touch-target py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark Served</span>
          </button>
        )}

        <button
          onClick={() => onUpdateStatus(order._id, 'Cancelled')}
          className="touch-target w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
          title="Cancel Order"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import { useEffect } from 'react';
import { getSocket } from '../lib/socket.js';
import { Order, OrderStatus } from '../types/index.js';

interface UseOrderSocketProps {
  tableNumber?: number;
  isKitchen?: boolean;
  onNewOrder?: (order: Order) => void;
  onStatusChange?: (payload: {
    orderId: string;
    orderStatus: OrderStatus;
    tableNumber: number;
    servedAt?: string;
  }) => void;
  onStockToggle?: (payload: { menuItemId: string; isAvailable: boolean }) => void;
}

export const useOrderSocket = ({
  tableNumber,
  isKitchen = false,
  onNewOrder,
  onStatusChange,
  onStockToggle,
}: UseOrderSocketProps) => {
  useEffect(() => {
    const socket = getSocket();

    if (isKitchen) {
      socket.emit('join:kitchen');
    }

    if (tableNumber) {
      socket.emit('join:table', tableNumber);
    }

    const handleNewOrder = (order: Order) => {
      onNewOrder?.(order);
    };

    const handleStatusChange = (payload: {
      orderId: string;
      orderStatus: OrderStatus;
      tableNumber: number;
      servedAt?: string;
    }) => {
      onStatusChange?.(payload);
    };

    const handleStockToggle = (payload: { menuItemId: string; isAvailable: boolean }) => {
      onStockToggle?.(payload);
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:status-change', handleStatusChange);
    socket.on('stock:toggle', handleStockToggle);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status-change', handleStatusChange);
      socket.off('stock:toggle', handleStockToggle);
    };
  }, [tableNumber, isKitchen, onNewOrder, onStatusChange, onStockToggle]);
};

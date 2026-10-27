import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Order, OrderStatus } from '../models/Order.js';
import { MenuItem } from '../models/MenuItem.js';
import { Table } from '../models/Table.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableNumber, items } = req.body;

    if (!tableNumber || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'tableNumber and a non-empty items array are required.',
      });
      return;
    }

    // Retrieve and validate menu items from database
    const itemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
    const dbMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
    const dbItemMap = new Map(dbMenuItems.map((item) => [item._id.toString(), item]));

    let subtotal = 0;
    let maxPrepTime = 15;
    const orderItems = [];

    for (const requestedItem of items) {
      const dbItem = dbItemMap.get(requestedItem.menuItemId);
      if (!dbItem) {
        res.status(400).json({
          success: false,
          message: `Menu item with ID ${requestedItem.menuItemId} was not found.`,
        });
        return;
      }

      if (!dbItem.isAvailable) {
        res.status(400).json({
          success: false,
          message: `Item "${dbItem.name}" is currently marked out of stock.`,
        });
        return;
      }

      const qty = Math.max(1, Number(requestedItem.quantity) || 1);
      const itemSubtotal = dbItem.price * qty;
      subtotal += itemSubtotal;

      if (dbItem.basePrepTimeMinutes > maxPrepTime) {
        maxPrepTime = dbItem.basePrepTimeMinutes;
      }

      orderItems.push({
        menuItemId: dbItem._id as Types.ObjectId,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qty,
        specialInstructions: requestedItem.specialInstructions?.trim() || '',
      });
    }

    // Compute Tax (15%) and Total
    const tax = Math.round(subtotal * 0.15 * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;

    const order = await Order.create({
      tableNumber: Number(tableNumber),
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      totalAmount,
      paymentStatus: 'Pending',
      orderStatus: 'Received',
      estimatedPrepTimeMinutes: maxPrepTime,
    });

    // Update physical table occupation status
    await Table.findOneAndUpdate(
      { tableNumber: Number(tableNumber) },
      { isOccupied: true, activeOrderId: order._id }
    );

    // Broadcast new order via Socket.io to kitchen display
    const io = req.app.get('io');
    if (io) {
      io.emit('order:new', order);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ success: false, message: 'Server error processing customer order.' });
  }
};

export const getActiveOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({
      orderStatus: { $nin: ['Served', 'Cancelled'] },
    }).sort({ createdAt: 1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error in getActiveOrders:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving active orders.' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses: OrderStatus[] = ['Received', 'Cooking', 'Ready', 'Served', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid orderStatus. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const updateFields: Record<string, unknown> = { orderStatus };
    if (orderStatus === 'Served') {
      updateFields.servedAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(id, updateFields, { new: true });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // If order is served or cancelled, free the table if this was its active order
    if (orderStatus === 'Served' || orderStatus === 'Cancelled') {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber, activeOrderId: order._id },
        { isOccupied: false, activeOrderId: null }
      );
    }

    // Broadcast status change via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('order:status-change', {
        orderId: order._id,
        orderStatus: order.orderStatus,
        tableNumber: order.tableNumber,
        servedAt: order.servedAt,
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ success: false, message: 'Server error updating order status.' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving order.' });
  }
};

export const getOrdersByTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableNumber } = req.params;
    const orders = await Order.find({ tableNumber: Number(tableNumber) })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error in getOrdersByTable:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving table orders.' });
  }
};

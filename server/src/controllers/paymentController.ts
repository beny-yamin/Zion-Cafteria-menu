import { Request, Response } from 'express';
import { Order, IOrderItem } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { MenuItem } from '../models/MenuItem.js';
import { Table } from '../models/Table.js';
import { ChapaService } from '../services/chapaService.js';
import { getQrBaseUrl } from '../utils/qrUrl.js';

export const initializePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableNumber, items, customerName, customerEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Your order must contain at least one item.' });
      return;
    }

    const assignedTable = Number(tableNumber) || 0;

    // Check if table is deactivated (if tableNumber > 0)
    if (assignedTable > 0) {
      const tableRecord = await Table.findOne({ tableNumber: assignedTable });
      if (tableRecord && tableRecord.status === 'deactivated') {
        res.status(403).json({
          success: false,
          message: `Table #${assignedTable} is currently deactivated. Please contact cafeteria staff.`,
        });
        return;
      }
    }

    // Validate menu items & calculate subtotal
    const orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        res.status(404).json({ success: false, message: `Menu item not found: ${item.menuItemId}` });
        return;
      }
      if (!menuItem.isAvailable) {
        res.status(400).json({ success: false, message: `Item is currently out of stock: ${menuItem.name}` });
        return;
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      orderItems.push({
        menuItemId: menuItem._id as any,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        specialInstructions: (item.specialInstructions || '').trim(),
      });
      subtotal += menuItem.price * qty;
    }

    // 15% VAT / Service charge
    const tax = Math.round(subtotal * 0.15 * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;

    // Generate sequential order number
    const lastOrder = await Order.findOne().sort({ createdAt: -1 }).select('orderNumber');
    const orderNumber = lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 1001;

    const tx_ref = `zion-${orderNumber}-${Date.now()}`;

    // Create order with paymentStatus: 'Pending', orderStatus: 'Pending'
    const order = await Order.create({
      orderNumber,
      tableNumber: assignedTable,
      items: orderItems,
      subtotal,
      tax,
      totalAmount,
      currency: 'ETB',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      tx_ref,
      customerName: (customerName || '').trim(),
      customerEmail: (customerEmail || '').trim(),
      estimatedPrepTimeMinutes: 15,
    });

    // Create payment ledger record
    const payment = await Payment.create({
      orderId: order._id,
      orderNumber,
      tx_ref,
      amount: totalAmount,
      currency: 'ETB',
      status: 'pending',
      customerName: (customerName || '').trim(),
      customerEmail: (customerEmail || '').trim(),
    });

    order.paymentId = payment._id as any;
    await order.save();

    // Determine return URL pointing directly to the deployed application
    const clientOrigin = getQrBaseUrl();
    const returnUrl = `${clientOrigin}/payment/verify?tx_ref=${encodeURIComponent(tx_ref)}`;

    const chapaRes = await ChapaService.initialize({
      amount: totalAmount,
      currency: 'ETB',
      email: customerEmail,
      firstName: customerName || 'Customer',
      tx_ref,
      returnUrl,
      customizationTitle: 'Zion Cafeteria',
      customizationDescription: `Order #${orderNumber} (${assignedTable === 0 ? 'General' : `Table ${assignedTable}`})`,
    });

    res.status(201).json({
      success: true,
      checkoutUrl: chapaRes.data?.checkout_url || returnUrl,
      tx_ref,
      orderNumber,
      orderId: order._id,
      totalAmount,
    });
  } catch (error: any) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment initialization failed' });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawTxRef = req.params.tx_ref;
    const tx_ref = String(Array.isArray(rawTxRef) ? rawTxRef[0] : rawTxRef || '');
    if (!tx_ref) {
      res.status(400).json({ success: false, message: 'Transaction reference tx_ref is required.' });
      return;
    }

    const payment = await Payment.findOne({ tx_ref });
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found for this reference.' });
      return;
    }

    const order = await Order.findById(payment.orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Associated order not found.' });
      return;
    }

    // Idempotent check: if already verified as paid
    if (payment.status === 'paid' && order.paymentStatus === 'Paid') {
      res.json({
        success: true,
        verified: true,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          totalAmount: order.totalAmount,
          currency: order.currency || 'ETB',
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          items: order.items,
          createdAt: order.createdAt,
        },
      });
      return;
    }

    // Query Chapa verification API
    const verification = await ChapaService.verify(tx_ref);

    if (verification.status === 'success' && verification.data?.status === 'success') {
      payment.status = 'paid';
      payment.chapaReference = verification.data?.reference || '';
      payment.rawVerificationResponse = verification.data;
      await payment.save();

      order.paymentStatus = 'Paid';
      order.orderStatus = 'Accepted';
      await order.save();

      // Emit new paid order to kitchen tablet room via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.to('kitchen').emit('order:new', order);
        io.to(`table:${order.tableNumber}`).emit('order:status-change', {
          orderId: order._id,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
        });
      }

      res.json({
        success: true,
        verified: true,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          totalAmount: order.totalAmount,
          currency: order.currency || 'ETB',
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          items: order.items,
          createdAt: order.createdAt,
        },
      });
    } else {
      payment.status = 'verification_failed';
      payment.rawVerificationResponse = verification.data || undefined;
      await payment.save();

      order.paymentStatus = 'Failed';
      await order.save();

      res.status(400).json({
        success: false,
        verified: false,
        message: 'Payment verification failed with provider.',
      });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawTxRef = req.body?.tx_ref || req.query?.tx_ref;
    const tx_ref = String(Array.isArray(rawTxRef) ? rawTxRef[0] : rawTxRef || '');
    if (tx_ref) {
      const payment = await Payment.findOne({ tx_ref });
      if (payment && payment.status !== 'paid') {
        const verification = await ChapaService.verify(tx_ref);
        if (verification.status === 'success' && verification.data?.status === 'success') {
          payment.status = 'paid';
          payment.rawVerificationResponse = verification.data;
          await payment.save();

          const order = await Order.findById(payment.orderId);
          if (order && order.paymentStatus !== 'Paid') {
            order.paymentStatus = 'Paid';
            order.orderStatus = 'Accepted';
            await order.save();

            const io = req.app.get('io');
            if (io) {
              io.to('kitchen').emit('order:new', order);
            }
          }
        }
      }
    }
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.json({ status: 'error' });
  }
};

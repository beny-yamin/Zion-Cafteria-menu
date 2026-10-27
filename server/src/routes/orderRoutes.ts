import { Router } from 'express';
import {
  createOrder,
  getActiveOrders,
  updateOrderStatus,
  getOrderById,
  getOrdersByTable,
} from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: frictionless customer ordering & tracking
router.post('/', createOrder);
router.get('/table/:tableNumber', getOrdersByTable);
router.get('/:id', getOrderById);

// Protected: Kitchen staff and owner order management
router.get('/active', requireAuth, requireRole(['Owner', 'KitchenStaff']), getActiveOrders);
router.patch('/:id/status', requireAuth, requireRole(['Owner', 'KitchenStaff']), updateOrderStatus);

export default router;

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

// 1. Specific static sub-paths first
router.get('/active', requireAuth, requireRole(['Owner', 'KitchenStaff']), getActiveOrders);
router.get('/table/:tableNumber', getOrdersByTable);

// 2. Generic parameterized sub-path after
router.get('/:id', getOrderById);

// 3. Mutation endpoints
router.post('/', createOrder);
router.patch('/:id/status', requireAuth, requireRole(['Owner', 'KitchenStaff']), updateOrderStatus);

export default router;

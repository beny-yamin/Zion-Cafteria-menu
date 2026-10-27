import { Router } from 'express';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Customers can fetch available menu items
router.get('/', getMenuItems);

// Protected: Staff and Owner operations
router.post('/', requireAuth, requireRole(['Owner']), createMenuItem);
router.put('/:id', requireAuth, requireRole(['Owner']), updateMenuItem);
router.delete('/:id', requireAuth, requireRole(['Owner']), deleteMenuItem);
router.patch('/:id/stock', requireAuth, requireRole(['Owner', 'KitchenStaff']), toggleStock);

export default router;

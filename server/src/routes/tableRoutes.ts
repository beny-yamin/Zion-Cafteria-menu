import { Router } from 'express';
import {
  getTables,
  generateTables,
  resetTableStatus,
} from '../controllers/tableController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protected: Owner table setup and oversight
router.get('/', requireAuth, requireRole(['Owner', 'KitchenStaff']), getTables);
router.post('/generate', requireAuth, requireRole(['Owner']), generateTables);
router.patch('/:tableNumber/reset', requireAuth, requireRole(['Owner', 'KitchenStaff']), resetTableStatus);

export default router;

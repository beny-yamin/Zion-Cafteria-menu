import { Router } from 'express';
import {
  getTables,
  createQr,
  generateTables,
  toggleTableStatus,
  regenerateQr,
  deleteTable,
  checkTable,
  resetTableStatus,
} from '../controllers/tableController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Check table status when customer scans QR
router.get('/check/:tableNumber', checkTable);

// Protected: Staff and Owner QR code management
router.get('/', requireAuth, requireRole(['Owner', 'KitchenStaff']), getTables);
router.post('/create', requireAuth, requireRole(['Owner']), createQr);
router.post('/generate', requireAuth, requireRole(['Owner']), generateTables);
router.patch('/:id/toggle-status', requireAuth, requireRole(['Owner']), toggleTableStatus);
router.patch('/:id/regenerate', requireAuth, requireRole(['Owner']), regenerateQr);
router.delete('/:id', requireAuth, requireRole(['Owner']), deleteTable);
router.patch('/:tableNumber/reset', requireAuth, requireRole(['Owner', 'KitchenStaff']), resetTableStatus);

export default router;

import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protected: Owner dashboard metrics
router.get('/dashboard', requireAuth, requireRole(['Owner']), getDashboardAnalytics);

export default router;

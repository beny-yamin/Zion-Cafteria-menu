import { Router } from 'express';
import { login, getCurrentUser, registerStaff } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Staff login endpoint
router.post('/login', login);

// Protected: Get current user info
router.get('/me', requireAuth, getCurrentUser);

// Protected: Owner registers new staff member
router.post('/register', requireAuth, requireRole(['Owner']), registerStaff);

export default router;

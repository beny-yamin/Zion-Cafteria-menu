import { Router } from 'express';
import {
  login,
  firebaseSync,
  getCurrentUser,
  getAllUsers,
  createUserAccount,
  updateUserRole,
  resetUserPassword,
  deleteUserAccount,
} from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Staff & customer login & Firebase token sync
router.post('/login', login);
router.post('/firebase-sync', firebaseSync);

// Protected: Current user profile
router.get('/me', requireAuth, getCurrentUser);

// Protected: Owner user and staff administration
router.get('/users', requireAuth, requireRole(['Owner']), getAllUsers);
router.post('/users', requireAuth, requireRole(['Owner']), createUserAccount);
router.patch('/users/:id/role', requireAuth, requireRole(['Owner']), updateUserRole);
router.patch('/users/:id/password', requireAuth, requireRole(['Owner']), resetUserPassword);
router.delete('/users/:id', requireAuth, requireRole(['Owner']), deleteUserAccount);

export default router;

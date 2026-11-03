import { Router } from 'express';
import {
  login,
  register,
  demoLogin,
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

// Public: Shared authentication & Portfolio demo access
router.post('/login', login);
router.post('/register', register);
router.post('/demo-login', demoLogin);
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

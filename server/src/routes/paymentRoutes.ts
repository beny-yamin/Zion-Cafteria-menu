import { Router } from 'express';
import { initializePayment, verifyPayment, handleWebhook } from '../controllers/paymentController.js';

const router = Router();

router.post('/initialize', initializePayment);
router.get('/verify/:tx_ref', verifyPayment);
router.post('/webhook', handleWebhook);

export default router;

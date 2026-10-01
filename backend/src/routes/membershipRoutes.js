import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getMembershipStatus,
    purchaseCredits,
    upgradeToPremium,
    createBinanceOrder,
    verifyBinanceOrder,
    handleBinanceWebhook,
    submitManualPayment
} from '../controllers/membershipController.js';

const router = express.Router();

// Binance webhook must be unauthenticated because it is called directly by Binance Pay servers
router.post('/binance-webhook', handleBinanceWebhook);

// All subsequent routes require authentication
router.use(authenticateToken);

router.get('/status', getMembershipStatus);
router.post('/purchase', purchaseCredits);
router.post('/upgrade', upgradeToPremium);
router.post('/create-binance-order', createBinanceOrder);
router.get('/verify-order/:merchantTradeNo', verifyBinanceOrder);
router.post('/submit-manual-payment', submitManualPayment);

export default router;




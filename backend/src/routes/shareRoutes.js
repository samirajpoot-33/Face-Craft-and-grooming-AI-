import express from 'express';
import { logShare, getShareStats } from '../controllers/shareController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public/Authenticated route to log a share
// Optional auth - we log user_id if they are logged in
router.post('/log', (req, res, next) => {
    // Try to authenticate but don't fail if no token (allow guest shares)
    authenticateToken(req, res, () => {
        next();
    });
}, logShare);

// Admin only route to get stats
router.get('/stats', authenticateToken, isAdmin, getShareStats);

export default router;

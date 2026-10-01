/**
 * Beard Try-On routes (public demo — no auth required)
 */

import express from 'express';
import uploadHairstyle from '../middleware/uploadHairstyle.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkCredits } from '../middleware/checkCredits.js';
import { swapBeardHandler, getBeardStyles } from '../controllers/beardTryOnController.js';

const router = express.Router();

router.get('/styles', getBeardStyles);
router.post('/swap', authenticateToken, checkCredits, uploadHairstyle.single('image'), swapBeardHandler);

export default router;

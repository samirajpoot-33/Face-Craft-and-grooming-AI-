/**

 * Hairstyle Try-On routes (public demo — no auth required)

 */



import express from 'express';
import uploadHairstyle from '../middleware/uploadHairstyle.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkCredits } from '../middleware/checkCredits.js';

import {
  swapHairstyleHandler,
  getHairstyleStyles,
} from '../controllers/hairstyleTryOnController.js';

const router = express.Router();

router.get('/styles', getHairstyleStyles);
router.post('/swap', authenticateToken, checkCredits, uploadHairstyle.single('image'), swapHairstyleHandler);



export default router;


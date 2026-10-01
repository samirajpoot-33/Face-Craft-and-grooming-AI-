/**
 * Face Analysis Routes
 *
 * Defines all face analysis-related endpoints
 * All routes are protected (require authentication) except products/tips (public for display)
 */

import express from 'express';
import upload from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkCredits } from '../middleware/checkCredits.js';
import {
    analyzeFace,
    analyzeSkin,
    getAnalysisHistory,
    getAnalysisById,
    getProductsForSkinType,
    getTipsForSkinType,
    getProductImage,
} from '../controllers/faceAnalysisController.js';

const router = express.Router();

/**
 * POST /api/face-analysis/analyze
 * Upload image and analyze face shape (Step 1)
 */
router.post('/analyze', authenticateToken, checkCredits, upload.single('image'), analyzeFace);

/**
 * POST /api/face-analysis/analyze-skin
 * Step 2: Upload image and analyze skin only
 */
router.post('/analyze-skin', authenticateToken, checkCredits, upload.single('image'), analyzeSkin);

/**
 * GET /api/face-analysis/history
 * Get user's face analysis history
 */
router.get('/history', authenticateToken, getAnalysisHistory);

/**
 * GET /api/face-analysis/products/:skinType
 * Get product image list for skin type (dry, normal, oily)
 */
router.get('/products/:skinType', getProductsForSkinType);

/**
 * GET /api/face-analysis/products/:skinType/:filename
 * Get product image file
 */
router.get('/products/:skinType/:filename', getProductImage);

/**
 * GET /api/face-analysis/tips/:skinType
 * Get grooming tips for skin type
 */
router.get('/tips/:skinType', getTipsForSkinType);

/**
 * GET /api/face-analysis/:id
 * Get specific analysis by ID
 */
router.get('/:id', authenticateToken, getAnalysisById);

export default router;

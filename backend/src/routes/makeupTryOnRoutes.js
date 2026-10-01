/**
 * Makeup Try-On Routes
 * 
 * Routes for makeup virtual try-on operations
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    saveMakeupTryOn,
    getUserMakeupTryOns,
    getMakeupTryOnById,
    deleteMakeupTryOn
} from '../controllers/makeupTryOnController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/makeup-tryon/save
 * Save makeup try-on session
 */
router.post('/save', saveMakeupTryOn);

/**
 * GET /api/makeup-tryon
 * Get user's makeup try-on history
 */
router.get('/', getUserMakeupTryOns);

/**
 * GET /api/makeup-tryon/:id
 * Get single makeup try-on session by ID
 */
router.get('/:id', getMakeupTryOnById);

/**
 * DELETE /api/makeup-tryon/:id
 * Delete makeup try-on session
 */
router.delete('/:id', deleteMakeupTryOn);

export default router;

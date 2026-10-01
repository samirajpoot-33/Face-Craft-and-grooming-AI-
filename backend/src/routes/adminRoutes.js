/**
 * Admin Routes
 * 
 * Admin-only endpoints
 */

import express from 'express';
import { isAdmin } from '../middleware/adminAuth.js';
import {
    adminLogin,
    getAllUsers,
    getUserStats,
    deleteUser,
    getChatbotConversations,
    getChatbotStats,
    deleteChatbotConversation,
    getAllFaceAnalyses,
    deleteFaceAnalysis,
    getAllMakeupTryOns,
    getMakeupTryOnStats,
    deleteMakeupTryOn,
    broadcastNotification,
    sendNotificationToUser,
    getManualPayments,
    approveManualPayment,
    rejectManualPayment,
    giftCreditsToAll,
    updateUserCredits,
    updateUserPremium,
    makeAllUsersFree,
    updateUserPassword
} from '../controllers/adminController.js';
import {
    getAllHairstyleTryOns,
    getAllBeardTryOns,
    getGroomingTryOnStats,
    deleteHairstyleTryOn,
    deleteBeardTryOn,
} from '../controllers/groomingTryOnAdminController.js';

const router = express.Router();

/**
 * POST /api/admin/login
 * Admin login (public endpoint, but requires admin credentials)
 */
router.post('/login', adminLogin);

// All routes below require admin authentication
router.use(isAdmin);

/**
 * GET /api/admin/users
 * Get all users (Admin only)
 */
router.get('/users', getAllUsers);

/**
 * GET /api/admin/stats
 * Get user statistics (Admin only)
 */
router.get('/stats', getUserStats);

/**
 * GET /api/admin/chatbot/conversations
 * Get chatbot conversations (Admin only)
 */
router.get('/chatbot/conversations', getChatbotConversations);

/**
 * GET /api/admin/chatbot/stats
 * Get chatbot statistics (Admin only)
 */
router.get('/chatbot/stats', getChatbotStats);

/**
 * DELETE /api/admin/chatbot/conversations/:id
 * Delete chatbot conversation (Admin only)
 */
router.delete('/chatbot/conversations/:id', deleteChatbotConversation);

/**
 * GET /api/admin/face-analysis
 * Get all face analysis records (Admin only)
 */
router.get('/face-analysis', getAllFaceAnalyses);

/**
 * DELETE /api/admin/face-analysis/:id
 * Delete face analysis record (Admin only)
 */
router.delete('/face-analysis/:id', deleteFaceAnalysis);

/**
 * GET /api/admin/makeup-tryon
 * Get all makeup try-on sessions (Admin only)
 */
router.get('/makeup-tryon', getAllMakeupTryOns);

/**
 * GET /api/admin/makeup-tryon/stats
 * Get makeup try-on statistics (Admin only)
 */
router.get('/makeup-tryon/stats', getMakeupTryOnStats);

/**
 * DELETE /api/admin/makeup-tryon/:id
 * Delete makeup try-on session (Admin only)
 */
router.delete('/makeup-tryon/:id', deleteMakeupTryOn);

router.get('/hairstyle-tryon', getAllHairstyleTryOns);
router.get('/beard-tryon', getAllBeardTryOns);
router.get('/grooming-tryon/stats', getGroomingTryOnStats);
router.delete('/hairstyle-tryon/:id', deleteHairstyleTryOn);
router.delete('/beard-tryon/:id', deleteBeardTryOn);

/**
 * DELETE /api/admin/users/:id
 * Delete user (Admin only)
 */
router.delete('/users/:id', deleteUser);

/**
 * POST /api/admin/users/gift-credits
 * Gift credits to all active users (Admin only)
 */
router.post('/users/gift-credits', giftCreditsToAll);
router.post('/users/make-all-free', makeAllUsersFree);

/**
 * POST /api/admin/users/:id/credits
 * Update credits for a specific user (Admin only)
 */
router.post('/users/:id/credits', updateUserCredits);
router.post('/users/:id/premium', updateUserPremium);
router.post('/users/:id/change-password', updateUserPassword);

/**
 * POST /api/admin/notifications/send
 * Send notification to a specific user (Admin only)
 * Body: { userId, title, message, type?, link? }
 */
router.post('/notifications/send', sendNotificationToUser);

/**
 * POST /api/admin/notifications/broadcast
 * Broadcast notification to all users (Admin only)
 * Body: { title, message, type?, link? }
 */
router.post('/notifications/broadcast', broadcastNotification);

/**
 * GET /api/admin/manual-payments
 * Get all manual crypto payments
 */
router.get('/manual-payments', getManualPayments);

/**
 * POST /api/admin/manual-payments/:id/approve
 * Approve a manual crypto payment
 */
router.post('/manual-payments/:id/approve', approveManualPayment);

/**
 * POST /api/admin/manual-payments/:id/reject
 * Reject a manual crypto payment
 */
router.post('/manual-payments/:id/reject', rejectManualPayment);

export default router;

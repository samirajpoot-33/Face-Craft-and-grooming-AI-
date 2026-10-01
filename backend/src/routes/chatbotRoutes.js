/**
 * Chatbot Routes
 * 
 * Defines routes for AI chatbot functionality
 */

import express from 'express';
import { chat, healthCheck } from '../controllers/chatbotController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * Optional authentication middleware
 * Tries to authenticate but doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (!err) {
                    req.user = decoded;
                }
                next(); // Continue regardless
            });
        } else {
            next(); // No token, continue without auth
        }
    } catch (error) {
        next(); // Continue on error
    }
};

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI assistant
 * @access  Public (optional auth - tracks user_id if authenticated)
 */
router.post('/chat', optionalAuth, chat);

/**
 * @route   GET /api/ai/health
 * @desc    Check chatbot service health
 * @access  Public
 */
router.get('/health', healthCheck);

export default router;

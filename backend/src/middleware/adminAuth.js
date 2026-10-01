/**
 * Admin Authentication Middleware
 * 
 * Verifies that the user is an admin
 */

import { authenticateToken } from './auth.js';

export const isAdmin = (req, res, next) => {
    // First verify JWT token
    authenticateToken(req, res, () => {
        // Check if user is admin
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
    });
};

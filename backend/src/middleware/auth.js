/**
 * JWT Authentication Middleware
 * 
 * This middleware protects routes by verifying JWT tokens.
 * It extracts the token from the Authorization header and verifies it.
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware to verify JWT token
 * 
 * How it works:
 * 1. Extract token from Authorization header (format: "Bearer <token>")
 * 2. Verify token using JWT_SECRET
 * 3. Attach user info to request object
 * 4. Call next() to continue to the route handler
 * 
 * If token is invalid or missing, return 401 Unauthorized
 */
export const authenticateToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        // Format: "Bearer <token>"
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Split and get token part

        // If no token provided
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token.'
                });
            }

            // Attach user info to request object
            // Now req.user is available in protected routes
            req.user = decoded;
            next(); // Continue to the next middleware/route handler
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

import { query } from '../config/database.js';

/**
 * Middleware to check if user has enough credits or is premium
 */
export const checkCredits = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const users = await query(
            'SELECT credits, is_premium FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        // Attach to request for use in controllers
        req.user.credits = user.credits;
        req.user.is_premium = !!user.is_premium;

        // Premium users have unlimited access
        if (user.is_premium) {
            return next();
        }

        // Check if user has at least 1 credit
        if (user.credits <= 0) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient credits. Please upgrade to Premium or purchase more credits.',
                noCredits: true
            });
        }

        // If user has credits, proceed (we will deduct them in the controller)
        next();
    } catch (error) {
        console.error('Check credits middleware error:', error);
        res.status(500).json({ success: false, message: 'Server error checking credits' });
    }
};

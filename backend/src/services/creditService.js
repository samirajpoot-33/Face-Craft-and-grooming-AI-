import { query } from '../config/database.js';

/**
 * Deduct a single credit from user if they are not premium and log the usage transaction
 * @param {number} userId - The user ID
 * @param {string} description - Description of what the credit was used for
 * @returns {Promise<boolean>} True if a credit was deducted, false if user is premium
 */
export const deductCredit = async (userId, description) => {
    if (!userId) return false;

    try {
        // Check if user is premium
        const users = await query(
            'SELECT credits, is_premium FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            console.error(`[CreditService] User ${userId} not found for credit deduction`);
            return false;
        }

        const user = users[0];

        // Premium users have unlimited access and do not consume credits
        if (user.is_premium) {
            return false;
        }

        // Deduct 1 credit (using GREATEST to ensure credits never go below 0)
        await query(
            'UPDATE users SET credits = GREATEST(0, credits - 1) WHERE id = ?',
            [userId]
        );

        // Log the transaction
        await query(
            'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, -1, ?, ?)',
            [userId, 'usage', description]
        );

        console.log(`[CreditService] Deducted 1 credit from user ${userId} for: ${description}`);
        return true;
    } catch (error) {
        console.error('[CreditService] Error deducting credit:', error);
        throw error;
    }
};

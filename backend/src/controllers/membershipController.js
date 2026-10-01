import { query } from '../config/database.js';
import { createBinancePayOrder, queryBinancePayOrder } from '../services/binancePayService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Get current user's credits and membership status
 */
export const getMembershipStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const users = await query(
            'SELECT credits, is_premium FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            membership: users[0]
        });
    } catch (error) {
        console.error('Get membership error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Mock purchase credits (to be replaced with real payment logic)
 */
export const purchaseCredits = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, planId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        // 1. Update user credits
        await query(
            'UPDATE users SET credits = credits + ? WHERE id = ?',
            [amount, userId]
        );

        // 2. Log transaction
        await query(
            'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
            [userId, amount, 'purchase', `Purchased ${amount} credits (Plan: ${planId || 'Basic'})`]
        );

        res.status(200).json({
            success: true,
            message: `Successfully purchased ${amount} credits!`,
            newCredits: (await query('SELECT credits FROM users WHERE id = ?', [userId]))[0].credits
        });
    } catch (error) {
        console.error('Purchase credits error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Upgrade to Premium (Mocked)
 */
export const upgradeToPremium = async (req, res) => {
    try {
        const userId = req.user.id;

        await query(
            'UPDATE users SET is_premium = TRUE WHERE id = ?',
            [userId]
        );

        await query(
            'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
            [userId, 0, 'bonus', 'Upgraded to Premium Membership']
        );

        res.status(200).json({
            success: true,
            message: 'Welcome to FaceCraft Premium!',
            is_premium: true
        });
    } catch (error) {
        console.error('Upgrade error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Process a successful payment: credit the user and record transaction
 */
async function processSuccessfulPayment(merchantTradeNo) {
    const parts = merchantTradeNo.split('-');
    if (parts.length < 4 || parts[0] !== 'FC') {
        throw new Error('Invalid trade number format');
    }

    const planId = parts[1];
    const userId = Number(parts[2]);

    if (isNaN(userId)) {
        throw new Error('Invalid user ID in trade number');
    }

    // Check if already processed to prevent double-crediting
    const existingTx = await query(
        'SELECT id FROM transactions WHERE description LIKE ?',
        [`%${merchantTradeNo}%`]
    );

    if (existingTx.length > 0) {
        console.log(`[Payment] Order ${merchantTradeNo} already processed.`);
        return { success: true, alreadyProcessed: true };
    }

    if (planId === 'pro') {
        // Add 50 credits
        await query(
            'UPDATE users SET credits = credits + 50 WHERE id = ?',
            [userId]
        );
        // Log transaction
        await query(
            'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, 50, ?, ?)',
            [userId, 'purchase', `purchase`, `Purchased 50 credits via Binance Pay. Trade No: ${merchantTradeNo}`]
        );
        // Send notification
        try {
            await createNotification(
                userId,
                'new_feature',
                'Credits Added!',
                'Successfully purchased 50 AI credits. Enjoy our styling tools!',
                '/dashboard'
            );
        } catch (e) {
            console.error('Failed to create notification for credits purchase:', e.message);
        }
    } else if (planId === 'premium') {
        // Upgrade to premium
        await query(
            'UPDATE users SET is_premium = TRUE WHERE id = ?',
            [userId]
        );
        // Log transaction
        await query(
            'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, 0, ?, ?)',
            [userId, 'purchase', `purchase`, `Upgraded to Lifetime Premium via Binance Pay. Trade No: ${merchantTradeNo}`]
        );
        // Send notification
        try {
            await createNotification(
                userId,
                'new_feature',
                'Welcome to Premium!',
                'Successfully upgraded to Lifetime Premium. You now have unlimited access!',
                '/dashboard'
            );
        } catch (e) {
            console.error('Failed to create notification for premium upgrade:', e.message);
        }
    } else {
        throw new Error('Unknown plan ID');
    }

    console.log(`[Payment] Successfully processed payment for order ${merchantTradeNo}`);
    return { success: true, alreadyProcessed: false };
}

/**
 * Create a Binance Pay Order for a plan
 */
export const createBinanceOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { planId } = req.body;

        if (planId !== 'pro' && planId !== 'premium') {
            return res.status(400).json({ success: false, message: 'Invalid plan selected' });
        }

        const amount = planId === 'pro' ? 9.99 : 29.99;
        const creditsAmount = planId === 'pro' ? 50 : 0;
        const goodsName = planId === 'pro' ? '50 AI Credits Pack' : 'Lifetime Premium Membership';
        const goodsDetail = planId === 'pro' ? '50 Credits for AI Face analysis & hairstyle try-ons' : 'Unlimited lifetime access to all AI Facecraft tools';

        // Format trade number: FC-[planId]-[userId]-[timestamp]
        const merchantTradeNo = `FC-${planId}-${userId}-${Date.now()}`;

        // Return URLs
        const origin = req.headers.origin || 'http://localhost:5173';
        const returnUrl = `${origin}/dashboard?payment=success&tradeNo=${merchantTradeNo}`;
        const cancelUrl = `${origin}/pricing?payment=cancelled`;

        console.log(`[Payment] Creating Binance Order for user ${userId}, plan: ${planId}, trade: ${merchantTradeNo}`);

        const response = await createBinancePayOrder({
            merchantTradeNo,
            amount,
            currency: 'USDT',
            goodsName,
            goodsDetail,
            returnUrl,
            cancelUrl
        });

        if (response.status === 'SUCCESS' && response.data) {
            return res.status(200).json({
                success: true,
                checkoutUrl: response.data.checkoutUrl,
                qrCodeUrl: response.data.qrcodeLink,
                merchantTradeNo
            });
        } else {
            console.error('[Payment] Binance order creation error:', response);
            return res.status(502).json({ success: false, message: response.errorMessage || 'Binance Pay service error' });
        }
    } catch (error) {
        console.error('[Payment] Create Binance Order controller error:', error);
        res.status(500).json({ success: false, message: 'Server error creating payment order' });
    }
};

/**
 * Verify order status by querying Binance directly
 */
export const verifyBinanceOrder = async (req, res) => {
    try {
        const { merchantTradeNo } = req.params;
        if (!merchantTradeNo) {
            return res.status(400).json({ success: false, message: 'Trade number is required' });
        }

        console.log(`[Payment] Verifying order ${merchantTradeNo}`);
        const response = await queryBinancePayOrder(merchantTradeNo);

        if (response.status === 'SUCCESS' && response.data) {
            const status = response.data.status;
            if (status === 'PAID') {
                await processSuccessfulPayment(merchantTradeNo);
                return res.status(200).json({
                    success: true,
                    status: 'PAID',
                    message: 'Order paid and processed successfully'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    status: status,
                    message: `Order status is ${status}`
                });
            }
        } else {
            console.error('[Payment] Binance query order error:', response);
            return res.status(502).json({ success: false, message: 'Failed to verify order with Binance' });
        }
    } catch (error) {
        console.error('[Payment] Verify Binance Order controller error:', error);
        res.status(500).json({ success: false, message: 'Server error verifying payment' });
    }
};

/**
 * Webhook callback from Binance Pay
 */
export const handleBinanceWebhook = async (req, res) => {
    try {
        // To be completely safe from fake webhooks and certificate parsing issues, 
        // we extract the trade ID from the notification and query Binance directly
        const tradeNo = req.body?.bizPayload?.merchantTradeNo;

        if (!tradeNo) {
            console.warn('[Webhook] Webhook received without merchantTradeNo');
            return res.status(200).json({ returnCode: '000000', returnMsg: 'SUCCESS' });
        }

        console.log(`[Webhook] Webhook received for order ${tradeNo}. Verifying...`);
        const response = await queryBinancePayOrder(tradeNo);

        if (response.status === 'SUCCESS' && response.data && response.data.status === 'PAID') {
            await processSuccessfulPayment(tradeNo);
            console.log(`[Webhook] Webhook processed successfully for order ${tradeNo}`);
        } else {
            console.log(`[Webhook] Webhook order ${tradeNo} is not PAID according to Binance query`);
        }

        // Always reply success to Binance to stop notifications
        return res.status(200).json({ returnCode: '000000', returnMsg: 'SUCCESS' });
    } catch (error) {
        console.error('[Webhook] Binance Webhook error:', error);
        // Still reply success to Binance so they don't loop callbacks
        return res.status(200).json({ returnCode: '000000', returnMsg: 'SUCCESS' });
    }
};

/**
 * Submit a manual crypto payment for admin verification
 */
export const submitManualPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { planId, txId } = req.body;

        if (!planId || !txId) {
            return res.status(400).json({ success: false, message: 'Plan ID and Transaction ID are required' });
        }

        if (planId !== 'pro' && planId !== 'premium') {
            return res.status(400).json({ success: false, message: 'Invalid plan selected' });
        }

        // Check if txId was already submitted
        const existingTx = await query(
            'SELECT id FROM manual_payments WHERE tx_id = ?',
            [txId]
        );

        if (existingTx.length > 0) {
            return res.status(400).json({ success: false, message: 'This Transaction ID has already been submitted.' });
        }

        await query(
            'INSERT INTO manual_payments (user_id, plan_id, tx_id, status) VALUES (?, ?, ?, ?)',
            [userId, planId, txId, 'pending']
        );

        res.status(200).json({
            success: true,
            message: 'Payment submitted successfully. Please wait for admin approval.'
        });
    } catch (error) {
        console.error('[Payment] Submit manual payment error:', error);
        res.status(500).json({ success: false, message: 'Server error submitting payment' });
    }
};

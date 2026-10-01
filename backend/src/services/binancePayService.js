import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const BINANCE_PAY_API_BASE = process.env.BINANCE_PAY_API_BASE || 'https://bpay.binanceapi.com';

function generateNonce(length = 32) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateSignature(payload, timestamp, nonce, secretKey) {
    const payloadString = payload ? JSON.stringify(payload) : '';
    const message = `${timestamp}\n${nonce}\n${payloadString}\n`;
    return crypto.createHmac('sha512', secretKey).update(message).digest('hex').toUpperCase();
}

/**
 * Creates a Binance Pay Order
 * @param {Object} orderDetails - The order details
 * @param {string} orderDetails.merchantTradeNo - Unique trade number
 * @param {number} orderDetails.amount - Total amount
 * @param {string} orderDetails.currency - Currency (e.g. USDT)
 * @param {string} orderDetails.goodsName - Name of the goods
 * @param {string} orderDetails.goodsDetail - Description of the goods
 * @param {string} [orderDetails.returnUrl] - URL to redirect to after payment
 * @param {string} [orderDetails.cancelUrl] - URL to redirect to if payment is cancelled
 * @returns {Promise<Object>} The API response containing checkoutUrl
 */
export async function createBinancePayOrder(orderDetails) {
    const apiKey = process.env.BINANCE_API_KEY;
    const secretKey = process.env.BINANCE_SECRET_KEY;

    if (!apiKey || !secretKey) {
        console.warn('Binance Pay API keys are not configured in .env. Mocking response.');
        
        // Use the returnUrl as the checkout link to instantly simulate payment success in mock mode
        const mockSuccessUrl = orderDetails.returnUrl || 'http://localhost:5173/dashboard';
        return {
            status: 'SUCCESS',
            code: '000000',
            data: {
                checkoutUrl: mockSuccessUrl,
                qrcodeLink: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=240-185-11&bgcolor=15-23-42&data=' + encodeURIComponent(mockSuccessUrl)
            }
        };
    }

    const endpoint = '/binancepay/openapi/v2/order';
    const timestamp = Date.now().toString();
    const nonce = generateNonce();

    // The body for Binance Pay API
    const body = {
        env: {
            terminalType: 'WEB'
        },
        merchantTradeNo: orderDetails.merchantTradeNo,
        orderAmount: orderDetails.amount.toString(),
        currency: orderDetails.currency,
        goods: {
            goodsType: '02', // 02 means virtual goods
            goodsCategory: 'Z000',
            referenceGoodsId: 'credits',
            goodsName: orderDetails.goodsName,
            goodsDetail: orderDetails.goodsDetail
        }
    };

    if (orderDetails.returnUrl) {
        body.returnUrl = orderDetails.returnUrl;
    }
    if (orderDetails.cancelUrl) {
        body.cancelUrl = orderDetails.cancelUrl;
    }
    // Webhook URL to receive payment notification
    if (process.env.BINANCE_WEBHOOK_URL) {
        body.webhookUrl = process.env.BINANCE_WEBHOOK_URL;
    }

    const signature = generateSignature(body, timestamp, nonce, secretKey);

    try {
        const response = await axios.post(`${BINANCE_PAY_API_BASE}${endpoint}`, body, {
            headers: {
                'Content-Type': 'application/json',
                'BinancePay-Timestamp': timestamp,
                'BinancePay-Nonce': nonce,
                'BinancePay-Certificate-SN': apiKey,
                'BinancePay-Signature': signature
            }
        });

        return response.data;
    } catch (error) {
        console.error('Binance Pay Create Order Error:', error.response?.data || error.message);
        throw new Error('Failed to create Binance Pay order');
    }
}

/**
 * Validates the signature of incoming webhooks from Binance Pay
 */
export function verifyBinanceWebhookSignature(payload, timestamp, nonce, signature) {
    const secretKey = process.env.BINANCE_SECRET_KEY;
    if (!secretKey) return true; // Accept if testing without keys

    const calculatedSignature = generateSignature(payload, timestamp, nonce, secretKey);
    return calculatedSignature === signature;
}

/**
 * Queries a Binance Pay Order status
 * @param {string} merchantTradeNo - The unique trade number to query
 * @returns {Promise<Object>} The API response containing order status (e.g. PAID, INITIAL)
 */
export async function queryBinancePayOrder(merchantTradeNo) {
    const apiKey = process.env.BINANCE_API_KEY;
    const secretKey = process.env.BINANCE_SECRET_KEY;

    if (!apiKey || !secretKey) {
        console.warn('Binance Pay API keys are not configured in .env. Mocking query response.');
        // Return a mock PAID response for testing if keys are not set
        return {
            status: 'SUCCESS',
            code: '000000',
            data: {
                status: 'PAID',
                merchantTradeNo: merchantTradeNo,
                orderAmount: '9.99',
                currency: 'USDT'
            }
        };
    }

    const endpoint = '/binancepay/openapi/order/query';
    const timestamp = Date.now().toString();
    const nonce = generateNonce();

    const body = {
        merchantTradeNo: merchantTradeNo
    };

    const signature = generateSignature(body, timestamp, nonce, secretKey);

    try {
        const response = await axios.post(`${BINANCE_PAY_API_BASE}${endpoint}`, body, {
            headers: {
                'Content-Type': 'application/json',
                'BinancePay-Timestamp': timestamp,
                'BinancePay-Nonce': nonce,
                'BinancePay-Certificate-SN': apiKey,
                'BinancePay-Signature': signature
            }
        });

        return response.data;
    } catch (error) {
        console.error('Binance Pay Query Order Error:', error.response?.data || error.message);
        throw new Error('Failed to query Binance Pay order');
    }
}

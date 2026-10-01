/**
 * Chatbot Controller
 * 
 * Handles AI chatbot interactions using Google Gemini API
 * Provides intelligent responses about face shapes, hairstyles, and grooming
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '../config/database.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Generate unique conversation ID
const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Chat with AI assistant
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const chat = async (req, res) => {
    try {
        const { message, conversationHistory = [], conversationId } = req.body;
        
        // Get user ID from token (optional - allows anonymous users)
        const userId = req.user?.id || null;
        
        // Debug logging to check authentication
        console.log('🔐 Chatbot authentication check:');
        console.log('  - req.user:', req.user);
        console.log('  - userId extracted:', userId);
        console.log('  - Authorization header:', req.headers['authorization'] ? 'Present' : 'Missing');
        
        // Generate or use existing conversation ID
        const sessionId = conversationId || generateConversationId();

        // Validate message
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid message'
            });
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'AI service is not configured. Please contact administrator.'
            });
        }

        // Get the Gemini model
        // Using gemini-2.5-flash (fast, free tier) - latest and fastest model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Build conversation context with strict brevity and simplicity instructions
        const systemPrompt = `You are FaceCraft AI Assistant - a professional, concise AI assistant specializing in face care, grooming, skincare, hairstyles, and face shape analysis.

CRITICAL RESPONSE RULES:
- Keep responses VERY SHORT (30-60 words maximum)
- Use simple, everyday language - avoid technical jargon
- Write in a professional but friendly tone
- Use bullet points (•) for lists
- Be direct - answer only what's asked
- Use short sentences (max 15 words each)
- If user asks for details, expand slightly (but stay under 80 words)

Your expertise includes:
• Face shapes (Oval, Round, Square, Rectangle, Heart, Diamond) and analysis
• Hairstyle recommendations based on face shape
• Face care routines (face wash, cleansing, moisturizing)
• Skincare tips and products
• Grooming advice (beard, mustache, facial hair)
• Face wash recommendations for different skin types
• Skincare routines (morning/evening)
• General grooming and styling tips
• Face-related health and care questions

Response style:
- Professional but approachable
- Clear and actionable
- No fluff or filler words
- Use 1-2 emojis max (only when helpful)
- Answer questions about face care, grooming, skincare, and related topics
- If question is completely unrelated to face/grooming/skincare, politely redirect: "I specialize in face care, grooming, and skincare. How can I help with your face-related questions?"

Example good responses:
- "For oily skin, use a gentle foaming face wash twice daily. Look for salicylic acid or benzoyl peroxide. Follow with oil-free moisturizer."
- "Oval faces suit most hairstyles. Try side parts, layers, or bangs. Avoid styles that add width to cheeks."
- "Morning routine: Cleanser → Toner → Moisturizer → Sunscreen. Evening: Cleanser → Exfoliant (2-3x/week) → Serum → Moisturizer."

Remember: SHORT, SIMPLE, PROFESSIONAL. Answer any question related to face, grooming, skincare, or hairstyles.`;

        // Build conversation history for context
        let conversationContext = systemPrompt + '\n\n';
        
        // Add recent conversation history (last 5 messages for context)
        const recentHistory = conversationHistory.slice(-5);
        if (recentHistory.length > 0) {
            conversationContext += 'Previous conversation:\n';
            recentHistory.forEach(msg => {
                conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
            });
            conversationContext += '\n';
        }

        conversationContext += `User: ${message}\nAssistant:`;

        // Generate response
        const result = await model.generateContent(conversationContext);
        const response = await result.response;
        const reply = response.text().trim();

        // Save conversation to database
        try {
            console.log('💾 Saving conversation to database:');
            console.log('  - userId:', userId);
            console.log('  - message:', message.substring(0, 50) + '...');
            console.log('  - conversationId:', sessionId);
            
            await query(
                `INSERT INTO chatbot_conversations (user_id, message, response, conversation_id) 
                 VALUES (?, ?, ?, ?)`,
                [userId, message, reply, sessionId]
            );
            
            console.log('✅ Conversation saved successfully');
        } catch (dbError) {
            // Log but don't fail the request if DB save fails
            console.error('❌ Failed to save conversation to database:', dbError);
        }

        // Return response with conversation ID
        res.status(200).json({
            success: true,
            reply: reply,
            conversationId: sessionId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            code: error.code
        });
        
        // Handle model not found errors specifically
        if (error.message?.includes('not found') || error.message?.includes('404') || error.status === 404) {
            return res.status(500).json({
                success: false,
                message: 'Gemini model not available. Please verify your API key is valid and has access to Gemini models. You may need to regenerate your API key from https://makersuite.google.com/app/apikey'
            });
        }

        // Handle quota/rate limit errors
        if (error.message?.includes('quota') || 
            error.message?.includes('rate limit') || 
            error.message?.includes('429') ||
            error.status === 429 ||
            error.code === 429) {
            return res.status(429).json({
                success: false,
                message: '⚠️ Free tier quota exceeded (20 requests/day). Please wait a few minutes or try again tomorrow. The quota resets daily.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // Handle leaked API key error specifically
        if (error.message?.includes('leaked') || 
            error.message?.includes('reported as leaked')) {
            return res.status(500).json({
                success: false,
                message: '⚠️ Your API key has been reported as leaked and is no longer valid. Please generate a new API key from https://makersuite.google.com/app/apikey and update your .env file with GEMINI_API_KEY=new_key_here',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                help: 'To fix this: 1) Go to https://makersuite.google.com/app/apikey 2) Create a new API key 3) Update GEMINI_API_KEY in your backend/.env file 4) Restart your server'
            });
        }

        // Handle API key errors
        if (error.message?.includes('API key') || 
            error.message?.includes('401') || 
            error.message?.includes('403') ||
            error.status === 401 ||
            error.status === 403) {
            return res.status(500).json({
                success: false,
                message: 'Invalid API key. Please check your Gemini API key configuration. Get a new key from https://makersuite.google.com/app/apikey',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // Handle network/timeout errors
        if (error.message?.includes('timeout') || 
            error.message?.includes('network') ||
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT') {
            return res.status(503).json({
                success: false,
                message: 'Connection timeout. Please check your internet connection and try again.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            message: 'Sorry, I encountered an error. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Health check for chatbot service
 */
export const healthCheck = async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'Chatbot service is not configured'
            });
        }

        // Quick test to verify API key works
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Say "OK" if you can read this.');
        const response = await result.response;

        res.status(200).json({
            success: true,
            message: 'Chatbot service is operational',
            model: 'gemini-2.5-flash'
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Chatbot service is unavailable',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

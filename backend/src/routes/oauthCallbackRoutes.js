/**
 * OAuth Callback Routes
 * 
 * Handles OAuth callbacks from GitHub, Discord, Google, and Twitter
 */

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * GET /auth/github/callback
 * GitHub OAuth callback - exchanges code for token
 */
router.get('/github/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=github_auth_failed`);
        }

        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const redirectUri = `${backendUrl}/auth/github/callback`;

        if (!clientId || !clientSecret) {
            console.error('GitHub OAuth not configured');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=github_not_configured`);
        }

        // Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirectUri
            },
            {
                headers: { 
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        const { access_token, error: tokenError, error_description } = tokenResponse.data;

        if (tokenError || !access_token) {
            console.error('GitHub token exchange error:', tokenError || 'No access token');
            const errorMsg = tokenError === 'bad_verification_code' 
                ? 'github_code_expired' 
                : 'github_token_failed';
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${errorMsg}`);
        }

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/github/callback?token=${access_token}`);
    } catch (error) {
        console.error('GitHub callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=github_auth_failed`);
    }
});

/**
 * GET /auth/discord/callback
 * Discord OAuth callback - exchanges code for token
 */
router.get('/discord/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=discord_auth_failed`);
        }

        const clientId = process.env.DISCORD_CLIENT_ID;
        const clientSecret = process.env.DISCORD_CLIENT_SECRET;
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const redirectUri = `${backendUrl}/auth/discord/callback`;

        if (!clientId || !clientSecret) {
            console.error('Discord OAuth not configured');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=discord_not_configured`);
        }

        // Exchange code for access token
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            }),
            {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, error: tokenError, error_description } = tokenResponse.data;

        if (tokenError || !access_token) {
            console.error('Discord token exchange error:', tokenError || 'No access token', error_description);
            const errorMsg = tokenError === 'invalid_grant' 
                ? 'discord_code_expired' 
                : 'discord_token_failed';
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${errorMsg}`);
        }

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/discord/callback?token=${access_token}`);
    } catch (error) {
        console.error('Discord callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=discord_auth_failed`);
    }
});

/**
 * GET /auth/google/callback
 * Google OAuth callback - exchanges code for token
 */
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const redirectUri = `${backendUrl}/auth/google/callback`;

        if (!clientId || !clientSecret) {
            console.error('Google OAuth not configured');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_not_configured`);
        }

        // Exchange code for access token
        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            }),
            {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, error: tokenError, error_description } = tokenResponse.data;

        if (tokenError || !access_token) {
            console.error('Google token exchange error:', tokenError || 'No access token', error_description);
            const errorMsg = tokenError === 'invalid_grant' 
                ? 'google_code_expired' 
                : 'google_token_failed';
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${errorMsg}`);
        }

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/callback?token=${access_token}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
    }
});

/**
 * GET /auth/instagram/callback
 * Instagram OAuth callback - exchanges code for token
 */
router.get('/instagram/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        
        if (error) {
            console.error('Instagram OAuth error:', error);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=instagram_auth_failed`);
        }
        
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=instagram_auth_failed`);
        }

        const clientId = process.env.INSTAGRAM_CLIENT_ID;
        const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const redirectUri = `${backendUrl}/auth/instagram/callback`;

        if (!clientId || !clientSecret) {
            console.error('Instagram OAuth not configured');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=instagram_not_configured`);
        }

        // Exchange code for access token
        const tokenResponse = await axios.post(
            'https://api.instagram.com/oauth/access_token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code: code
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, error: tokenError, error_description } = tokenResponse.data;

        if (tokenError || !access_token) {
            console.error('Instagram token exchange error:', tokenError || 'No access token', error_description);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=instagram_token_failed`);
        }

        // Redirect to frontend with token - frontend will call backend API
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/instagram/callback?token=${access_token}`);
    } catch (error) {
        console.error('Instagram callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=instagram_auth_failed`);
    }
});

export default router;

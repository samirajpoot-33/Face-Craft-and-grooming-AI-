/**
 * OAuth Routes
 * 
 * Google, Instagram, GitHub, and Discord OAuth endpoints
 */

import express from 'express';
import axios from 'axios';
import { googleLogin, instagramLogin, githubLogin, discordLogin } from '../controllers/oauthController.js';

const router = express.Router();

/**
 * POST /api/oauth/google
 * Google OAuth login
 * Body: { credential } or { accessToken }
 */
router.post('/google', googleLogin);

/**
 * POST /api/oauth/instagram
 * Instagram OAuth login (FREE & EASY)
 * Body: { accessToken }
 */
router.post('/instagram', instagramLogin);

/**
 * POST /api/oauth/github
 * GitHub OAuth login (FREE & EASY)
 * Body: { accessToken }
 */
router.post('/github', githubLogin);

/**
 * POST /api/oauth/discord
 * Discord OAuth login (FREE & EASY)
 * Body: { accessToken }
 */
router.post('/discord', discordLogin);

export default router;

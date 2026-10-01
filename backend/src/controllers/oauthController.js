/**
 * OAuth Controller
 * 
 * Handles Google, Instagram, GitHub, and Discord OAuth authentication
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import { query } from '../config/database.js';

dotenv.config();

/**
 * Google OAuth Login
 * Handles both Google Sign-In credential (JWT) and OAuth access tokens
 */
export const googleLogin = async (req, res) => {
    try {
        const { credential, accessToken } = req.body;

        // Support both credential (JWT from Google Sign-In) and accessToken (OAuth 2.0)
        let googleData;

        if (credential) {
            // Google Sign-In returns a credential JWT token
            // Verify and decode the credential token
            try {
                const tokenInfoResponse = await axios.get(
                    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
                );
                googleData = {
                    id: tokenInfoResponse.data.sub,
                    email: tokenInfoResponse.data.email,
                    name: tokenInfoResponse.data.name,
                    picture: tokenInfoResponse.data.picture
                };
            } catch (tokenError) {
                console.error('Token verification error:', tokenError);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Google credential token'
                });
            }
        } else if (accessToken) {
            // OAuth 2.0 access token flow
            const googleResponse = await axios.get(
                `https://www.googleapis.com/oauth2/v2/userinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            googleData = googleResponse.data;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Google credential or access token required'
            });
        }

        const { id, email, name, picture } = googleData;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email not provided by Google'
            });
        }

        // Check if user exists
        let users = await query(
            'SELECT * FROM users WHERE email = ? OR (provider = ? AND provider_id = ?)',
            [email, 'google', id.toString()]
        );

        let user;

        if (users.length > 0) {
            // Update existing user
            user = users[0];
            await query(
                `UPDATE users SET 
                 provider = ?, 
                 provider_id = ?, 
                 profile_picture = ?,
                 full_name = ?
                 WHERE id = ?`,
                ['google', id.toString(), picture, name, user.id]
            );
            // Refresh user data
            user.profile_picture = picture;
            user.full_name = name;
        } else {
            // Create new user
            const username = email.split('@')[0] + '_' + Date.now().toString().slice(-6);
            const result = await query(
                `INSERT INTO users (username, email, password, full_name, profile_picture, provider, provider_id, role) 
                 VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
                [username, email, name, picture, 'google', id.toString(), 'user']
            );
            user = { 
                id: result.insertId, 
                username, 
                email, 
                full_name: name, 
                profile_picture: picture, 
                role: 'user' 
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Google login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name || name,
                profile_picture: user.profile_picture || picture,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Instagram OAuth Login
 * Instagram Basic Display API - FREE & EASY
 */
export const instagramLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Get user info from Instagram Graph API
        const instagramResponse = await axios.get(
            `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
        );

        const { id, username } = instagramResponse.data;
        
        if (!id || !username) {
            return res.status(400).json({
                success: false,
                message: 'Instagram user data not available'
            });
        }

        // Instagram Basic Display API doesn't provide email
        // We'll use username as identifier and create email from username
        const email = `${username}@instagram.local`;
        const displayName = username;
        const profilePicture = null; // Instagram Basic Display doesn't provide profile picture

        // Check if user exists
        let users = await query(
            'SELECT * FROM users WHERE (provider = ? AND provider_id = ?) OR username LIKE ?',
            ['instagram', id.toString(), `%${username}%`]
        );

        let user;

        if (users.length > 0) {
            // Update existing user
            user = users[0];
            await query(
                `UPDATE users SET 
                 provider = ?, 
                 provider_id = ?, 
                 full_name = ?,
                 profile_picture = ?
                 WHERE id = ?`,
                ['instagram', id.toString(), displayName, profilePicture, user.id]
            );
            user.full_name = displayName;
            user.profile_picture = profilePicture;
        } else {
            // Create new user
            const dbUsername = username + '_' + Date.now().toString().slice(-6);
            const result = await query(
                `INSERT INTO users (username, email, password, full_name, profile_picture, provider, provider_id, role) 
                 VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
                [dbUsername, email, displayName, profilePicture, 'instagram', id.toString(), 'user']
            );
            user = { 
                id: result.insertId, 
                username: dbUsername, 
                email, 
                full_name: displayName, 
                profile_picture: profilePicture, 
                role: 'user' 
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Instagram login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name || displayName,
                profile_picture: user.profile_picture || profilePicture,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Instagram login error:', error);
        res.status(500).json({
            success: false,
            message: 'Instagram authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * GitHub OAuth Login
 * GitHub OAuth is completely FREE and easy to set up
 */
export const githubLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Get user info from GitHub
        const githubResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const { id, login, name, email, avatar_url } = githubResponse.data;

        // GitHub might not return email if it's private
        // Try to get email from GitHub API
        let userEmail = email;
        if (!userEmail) {
            try {
                const emailResponse = await axios.get('https://api.github.com/user/emails', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                });
                const primaryEmail = emailResponse.data.find(e => e.primary) || emailResponse.data[0];
                userEmail = primaryEmail?.email || null;
            } catch (emailError) {
                console.warn('Could not fetch GitHub email:', emailError.message);
            }
        }

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email not provided by GitHub. Please make your email public in GitHub settings or use email/password login.'
            });
        }

        // Check if user exists
        let users = await query(
            'SELECT * FROM users WHERE email = ? OR (provider = ? AND provider_id = ?)',
            [userEmail, 'github', id.toString()]
        );

        let user;

        if (users.length > 0) {
            // Update existing user
            user = users[0];
            await query(
                `UPDATE users SET 
                 provider = ?, 
                 provider_id = ?, 
                 profile_picture = ?,
                 full_name = ?
                 WHERE id = ?`,
                ['github', id.toString(), avatar_url, name || login, user.id]
            );
            user.profile_picture = avatar_url;
            user.full_name = name || login;
        } else {
            // Create new user
            const username = login + '_' + Date.now().toString().slice(-6);
            const result = await query(
                `INSERT INTO users (username, email, password, full_name, profile_picture, provider, provider_id, role) 
                 VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
                [username, userEmail, name || login, avatar_url, 'github', id.toString(), 'user']
            );
            user = { 
                id: result.insertId, 
                username, 
                email: userEmail, 
                full_name: name || login, 
                profile_picture: avatar_url, 
                role: 'user' 
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'GitHub login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name || name || login,
                profile_picture: user.profile_picture || avatar_url,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('GitHub login error:', error);
        res.status(500).json({
            success: false,
            message: 'GitHub authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Discord OAuth Login
 * Discord OAuth is completely FREE and easy to set up
 */
export const discordLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Get user info from Discord
        const discordResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const { id, username, discriminator, email, avatar, global_name } = discordResponse.data;
        
        // Discord avatar URL construction
        const avatarUrl = avatar 
            ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
            : null;

        const displayName = global_name || username;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email not provided by Discord'
            });
        }

        // Check if user exists
        let users = await query(
            'SELECT * FROM users WHERE email = ? OR (provider = ? AND provider_id = ?)',
            [email, 'discord', id.toString()]
        );

        let user;

        if (users.length > 0) {
            // Update existing user
            user = users[0];
            await query(
                `UPDATE users SET 
                 provider = ?, 
                 provider_id = ?, 
                 profile_picture = ?,
                 full_name = ?
                 WHERE id = ?`,
                ['discord', id.toString(), avatarUrl, displayName, user.id]
            );
            user.profile_picture = avatarUrl;
            user.full_name = displayName;
        } else {
            // Create new user
            const dbUsername = username + '_' + Date.now().toString().slice(-6);
            const result = await query(
                `INSERT INTO users (username, email, password, full_name, profile_picture, provider, provider_id, role) 
                 VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
                [dbUsername, email, displayName, avatarUrl, 'discord', id.toString(), 'user']
            );
            user = { 
                id: result.insertId, 
                username: dbUsername, 
                email, 
                full_name: displayName, 
                profile_picture: avatarUrl, 
                role: 'user' 
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Discord login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name || displayName,
                profile_picture: user.profile_picture || avatarUrl,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Discord login error:', error);
        res.status(500).json({
            success: false,
            message: 'Discord authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

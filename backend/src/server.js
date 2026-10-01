/**
 * Server Entry Point
 * 
 * This file starts the Express server and connects to the database
 * Run this file to start the backend: npm start or npm run dev
 */

import app from './app.js';
import { testConnection, query } from './config/database.js';
import { startReminderScheduler } from './services/reminderScheduler.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Start Server
 * 
 * 1. Test database connection
 * 2. Ensure notifications table exists
 * 3. Start Express server
 * 4. Listen on specified port
 */
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Cannot start server without database connection');
            process.exit(1);
        }

        // Ensure notifications table exists (so users receive notifications)
        try {
            await query('SELECT 1 FROM notifications LIMIT 1');
        } catch (e) {
            if (e.message && (e.message.includes("doesn't exist") || e.message.includes('ER_NO_SUCH_TABLE'))) {
                console.warn('⚠️  Notifications table missing — users will not get notifications.');
                console.warn('   Run: cd backend && npm run fix-notifications');
            }
        }

        // Start server
        // Listen on 0.0.0.0 for cloud hosting (Cyclic, Render, etc.)
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n===========================================');
            console.log('🚀 FaceCraft Backend Server Started!');
            console.log('===========================================');
            console.log(`📍 Server running on: http://0.0.0.0:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Database: ${process.env.DB_NAME || 'facecraft_db'}`);
            console.log('===========================================\n');
            startReminderScheduler();
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

/**
 * Database Configuration
 * 
 * This file handles MySQL database connection using mysql2 with connection pooling.
 * Connection pooling helps manage multiple database connections efficiently.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Create a connection pool
 * 
 * Why pooling?
 * - Reuses connections instead of creating new ones each time
 * - Better performance and resource management
 * - Handles multiple concurrent requests efficiently
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'facecraft_db',
    port: parseInt(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
        rejectUnauthorized: false
    },
    connectTimeout: 20000 // 20 seconds
});

/**
 * Test database connection
 * This function checks if we can connect to the database
 */
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release(); // Release connection back to pool
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

/**
 * Execute a database query
 * 
 * @param {string} query - SQL query string
 * @param {array} params - Query parameters (for prepared statements)
 * @returns {Promise} Query result
 */
export const query = async (query, params = []) => {
    try {
        // If params is undefined or null, use empty array
        const safeParams = params || [];
        const [results] = await pool.execute(query, safeParams);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Export the pool for advanced usage if needed
export default pool;

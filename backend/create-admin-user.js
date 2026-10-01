/**
 * Create Admin User Script
 * Run this to create an admin user in the database
 * 
 * Usage: node create-admin-user.js
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'facecraft_db',
    port: parseInt(process.env.DB_PORT || 3306),
    ssl: {
        rejectUnauthorized: false
    },
    connectTimeout: 20000
};

async function createAdminUser() {
    let connection;
    
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        const adminEmail = 'admin@facecraft.com';
        const adminUsername = 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminFullName = 'System Administrator';

        // Check if admin already exists
        const [existing] = await connection.query(
            'SELECT id, username, email, role FROM users WHERE email = ? OR username = ?',
            [adminEmail, adminUsername]
        );

        if (existing.length > 0) {
            console.log('\n⚠️  Admin user already exists!');
            console.log(`Email: ${existing[0].email}`);
            console.log(`Username: ${existing[0].username}`);
            console.log(`Role: ${existing[0].role}`);
            console.log(`\n✅ You can login with:`);
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
            return;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        // Create admin user
        await connection.query(
            `INSERT INTO users (username, email, password, full_name, role, provider) 
             VALUES (?, ?, ?, ?, 'admin', 'local')`,
            [adminUsername, adminEmail, hashedPassword, adminFullName]
        );

        console.log('\n✅ Admin user created successfully!');
        console.log('\n📋 Admin Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${adminEmail}`);
        console.log(`Username: ${adminUsername}`);
        console.log(`Password: ${adminPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🔐 Login URL: http://localhost:5173/admin-login');
        console.log('\n⚠️  IMPORTANT: Change the password in production!');

    } catch (error) {
        console.error('\n❌ Error creating admin user:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('\n💡 Admin user already exists with this email/username');
        } else {
            console.error('\nFull error:', error);
            process.exit(1);
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the script
createAdminUser();

import { query } from '../config/database.js';

/**
 * Log a social media share event
 */
export const logShare = async (req, res) => {
    const { platform, resource_type, resource_id, share_url, image_url } = req.body;
    const user_id = req.user ? req.user.id : null;

    try {
        // Ensure shares table exists (safeguard for dev)
        await query(`
            CREATE TABLE IF NOT EXISTS shares (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                platform VARCHAR(50) NOT NULL,
                resource_type VARCHAR(50) NOT NULL,
                resource_id INT NULL,
                share_url TEXT NULL,
                image_url TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const result = await query(
            'INSERT INTO shares (user_id, platform, resource_type, resource_id, share_url, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, platform, resource_type, resource_id, share_url, image_url]
        );

        res.status(201).json({
            success: true,
            message: 'Share logged successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error logging share:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to log share event'
        });
    }
};

/**
 * Get sharing statistics for admin
 */
export const getShareStats = async (req, res) => {
    try {
        const stats = await query(`
            SELECT platform, COUNT(*) as count 
            FROM shares 
            GROUP BY platform
        `);

        const recentShares = await query(`
            SELECT s.*, u.username, u.email 
            FROM shares s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
            LIMIT 50
        `);

        res.json({
            success: true,
            data: {
                stats,
                recentShares
            }
        });
    } catch (error) {
        console.error('Error fetching share stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sharing statistics'
        });
    }
};

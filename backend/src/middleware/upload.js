/**
 * Multer Configuration for Image Uploads
 * 
 * Multer handles multipart/form-data (file uploads)
 * This configures where to store uploaded images and what file types to accept
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory (ES6 modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory
// On Vercel (serverless), we must use /tmp for any writes
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const uploadsDir = isVercel 
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '../uploads');

// Face analysis: original uploaded images go here
const faceAnalysisDir = path.join(uploadsDir, 'face-analysis');

// Create directories if they don't exist
try {
    [uploadsDir, faceAnalysisDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
} catch (err) {
    console.warn('⚠️ Could not create upload directories in middleware (expected on Vercel):', err.message);
}

/**
 * Configure storage for uploaded files (face analysis)
 * Saves to uploads/face-analysis/
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, faceAnalysisDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `face-${uniqueSuffix}${ext}`);
    }
});

/**
 * File filter - only allow image files
 */
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true); // Accept file
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

/**
 * Configure multer middleware
 * 
 * storage: Where and how to store files
 * limits: File size limits (5MB max)
 * fileFilter: What file types to accept
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: fileFilter
});

// Export single file upload middleware
// Use this in routes: upload.single('image')
export default upload;

/**
 * Multer Configuration for Profile Picture Uploads
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create profile uploads directory
// On Vercel (serverless), we must use /tmp for any writes
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const profileUploadsDir = isVercel 
    ? path.join('/tmp', 'uploads', 'profiles')
    : path.join(__dirname, '../uploads/profiles');

try {
    if (!fs.existsSync(profileUploadsDir)) {
        fs.mkdirSync(profileUploadsDir, { recursive: true });
    }
} catch (err) {
    console.warn('⚠️ Could not create profile upload directory (expected on Vercel):', err.message);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profileUploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

export const uploadProfile = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB max for profile pictures
    },
    fileFilter: fileFilter
});

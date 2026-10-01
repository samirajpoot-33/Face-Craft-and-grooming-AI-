/**
 * Multer configuration for makeup virtual try-on image uploads
 * Saves to uploads/makeup-virtual-try/
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel (serverless), we must use /tmp for any writes
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const makeupUploadsDir = isVercel 
    ? path.join('/tmp', 'uploads', 'makeup-virtual-try')
    : path.join(__dirname, '../uploads', 'makeup-virtual-try');

try {
    if (!fs.existsSync(makeupUploadsDir)) {
        fs.mkdirSync(makeupUploadsDir, { recursive: true });
    }
} catch (err) {
    console.warn('⚠️ Could not create makeup upload directory (expected on Vercel):', err.message);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, makeupUploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `makeup-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

const uploadMakeup = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
});

export default uploadMakeup;

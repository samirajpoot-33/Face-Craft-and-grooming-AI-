/**
 * Face Analysis Controller
 *
 * Handles face shape detection and analysis.
 * Calls Python face-shape service (MediaPipe + Random Forest) for real prediction.
 */

import { query } from '../config/database.js';
import { createNotification } from '../services/notificationService.js';
import { deductCredit } from '../services/creditService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FACE_SHAPE_SERVICE_URL = process.env.FACE_SHAPE_SERVICE_URL || 'http://localhost:5001';

/**
 * Call Python face-shape service to get real prediction (Heart, Oval, Round, Square).
 * Returns { face_shape, confidence } or null on error.
 */
async function getFaceShapeFromService(imagePath, originalname, mimetype) {
    const url = `${FACE_SHAPE_SERVICE_URL.replace(/\/$/, '')}/api/predict`;
    const buffer = fs.readFileSync(imagePath);
    const blob = new Blob([buffer], { type: mimetype || 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', blob, originalname || 'image.jpg');

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || `Face shape service error: ${response.status}`);
    }
    return {
        face_shape: data.face_shape,
        confidence: data.confidence,
        annotated_image_base64: data.annotated_image_base64 || null,
        landmarks_detected: data.landmarks_detected || false,
    };
}

/**
 * Call Python /predict for skin analysis only (Step 2).
 */
async function getSkinAnalysisFromService(imagePath, originalname, mimetype) {
    const url = `${FACE_SHAPE_SERVICE_URL.replace(/\/$/, '')}/predict`;
    const buffer = fs.readFileSync(imagePath);
    const blob = new Blob([buffer], { type: mimetype || 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', blob, originalname || 'image.jpg');

    const response = await fetch(url, { method: 'POST', body: formData });
    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || `Skin analysis service error: ${response.status}`);
    }
    return {
        skin_type: data.skin_type || null,
        skin_tone: data.skin_tone || null,
        acne_percent: data.acne_percent ?? 0,
        blackheads_percent: data.blackheads_percent ?? 0,
        darkspot_percent: data.darkspot_percent ?? 0,
        pores_percent: data.pores_percent ?? 0,
        wrinkles_percent: data.wrinkles_percent ?? 0,
    };
}

/**
 * Analyze face shape from uploaded image.
 * 1. Call Python ML service for real face shape (if running).
 * 2. Fallback to placeholder only if service is down (optional; or return error).
 * 3. Save to DB and return result.
 */
export const analyzeFace = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file',
            });
        }

        const userId = req.user.id;
        const imagePath = req.file.path;
        let faceShape = null;
        let confidenceScore = null;
        let annotatedImageBase64 = null;
        let landmarksDetected = false;

        try {
            const prediction = await getFaceShapeFromService(
                imagePath,
                req.file.originalname,
                req.file.mimetype
            );
            faceShape = prediction.face_shape;
            confidenceScore = prediction.confidence != null ? prediction.confidence : 92;
            annotatedImageBase64 = prediction.annotated_image_base64 || null;
            landmarksDetected = prediction.landmarks_detected || false;
        } catch (serviceError) {
            console.error('Face shape service error:', serviceError.message);
            return res.status(503).json({
                success: false,
                message:
                    'Face analysis service is unavailable. Please ensure the face-shape service is running (see face-shape-service/README.md).',
                error: serviceError.message,
            });
        }

        const result = await query(
            `INSERT INTO face_analysis (user_id, image_path, face_shape, confidence_score) 
             VALUES (?, ?, ?, ?)`,
            [userId, imagePath, faceShape, confidenceScore]
        );
        const analysisId = result.insertId;

        // Create notification: New hairstyle recommendations available
        await createNotification(
            userId,
            'face_analysis_complete',
            'Face analysis complete!',
            `New hairstyle recommendations are available for your ${faceShape} face shape.`,
            '/face-analyzer'
        );

        // Save annotated image to uploads/face-analysis/annotated/
        let annotatedImageUrl = null;
        if (annotatedImageBase64) {
            const annotatedDir = path.join(__dirname, '../uploads', 'face-analysis', 'annotated');
            if (!fs.existsSync(annotatedDir)) {
                fs.mkdirSync(annotatedDir, { recursive: true });
            }
            const annotatedPath = path.join(annotatedDir, `${analysisId}.jpg`);
            try {
                const buffer = Buffer.from(annotatedImageBase64, 'base64');
                fs.writeFileSync(annotatedPath, buffer);
                annotatedImageUrl = `/uploads/face-analysis/annotated/${analysisId}.jpg`;
            } catch (writeErr) {
                console.error('Failed to save annotated image:', writeErr.message);
            }
        }

        // Deduct 1 credit
        await deductCredit(userId, 'Face shape analysis');

        res.status(200).json({
            success: true,
            message: 'Face analysis completed',
            data: {
                id: analysisId,
                face_shape: faceShape,
                confidence_score: parseFloat(confidenceScore),
                image_path: imagePath,
                analysis_date: new Date().toISOString(),
                annotated_image_url: annotatedImageUrl,
                annotated_image_base64: annotatedImageBase64,
                landmarks_detected: landmarksDetected,
            },
        });
    } catch (error) {
        console.error('Face analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing face',
            error: error.message,
        });
    }
};

/**
 * Analyze skin only (Step 2) - user uploads image for skin analysis.
 */
export const analyzeSkin = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }
        const userId = req.user.id;
        const imagePath = req.file.path;
        let prediction = null;

        try {
            prediction = await getSkinAnalysisFromService(
                imagePath,
                req.file.originalname,
                req.file.mimetype
            );
        } catch (serviceError) {
            console.error('Skin analysis service error:', serviceError.message);
            return res.status(503).json({
                success: false,
                message: 'Skin analysis service is unavailable. Ensure face-shape service is running (python app.py).',
                error: serviceError.message,
            });
        }

        // Deduct 1 credit
        await deductCredit(userId, 'Skin metrics analysis');

        res.status(200).json({
            success: true,
            message: 'Skin analysis completed',
            data: {
                skin_type: prediction.skin_type,
                skin_tone: prediction.skin_tone,
                acne_percent: prediction.acne_percent,
                blackheads_percent: prediction.blackheads_percent,
                darkspot_percent: prediction.darkspot_percent,
                pores_percent: prediction.pores_percent,
                wrinkles_percent: prediction.wrinkles_percent,
            },
        });
    } catch (error) {
        console.error('Skin analysis error:', error);
        res.status(500).json({ success: false, message: 'Error analyzing skin', error: error.message });
    }
};

/**
 * Get user's face analysis history
 * Protected route - returns all analyses for the authenticated user
 */
export const getAnalysisHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all analyses for this user, ordered by most recent first
        const analyses = await query(
            `SELECT id, image_path, face_shape, confidence_score, analysis_date 
             FROM face_analysis 
             WHERE user_id = ? 
             ORDER BY analysis_date DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            count: analyses.length,
            data: analyses
        });
    } catch (error) {
        console.error('Get analysis history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analysis history',
            error: error.message
        });
    }
};

/**
 * Get a specific analysis by ID
 * Protected route - user can only access their own analyses
 */
export const getAnalysisById = async (req, res) => {
    try {
        const userId = req.user.id;
        const analysisId = req.params.id;

        const analyses = await query(
            `SELECT id, image_path, face_shape, confidence_score, analysis_date 
             FROM face_analysis 
             WHERE id = ? AND user_id = ?`,
            [analysisId, userId]
        );

        if (analyses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            data: analyses[0]
        });
    } catch (error) {
        console.error('Get analysis by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analysis',
            error: error.message
        });
    }
};

/**
 * Proxy: Get product list for skin type from Python service
 */
export const getProductsForSkinType = async (req, res) => {
    try {
        const { skinType } = req.params;
        const url = `${FACE_SHAPE_SERVICE_URL.replace(/\/$/, '')}/products/${encodeURIComponent(skinType)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(503).json({
            error: 'Products service unavailable',
            images: [],
        });
    }
};

/**
 * Proxy: Get grooming tips for skin type from Python service
 */
export const getTipsForSkinType = async (req, res) => {
    try {
        const { skinType } = req.params;
        const url = `${FACE_SHAPE_SERVICE_URL.replace(/\/$/, '')}/tips/${encodeURIComponent(skinType)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (error) {
        console.error('Get tips error:', error);
        res.status(503).json({
            error: 'Tips service unavailable',
            tips: '',
        });
    }
};

/**
 * Proxy: Get product image from Python service
 */
export const getProductImage = async (req, res) => {
    try {
        const { skinType, filename } = req.params;
        const url = `${FACE_SHAPE_SERVICE_URL.replace(/\/$/, '')}/products/${encodeURIComponent(skinType)}/${encodeURIComponent(filename)}`;
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Not found' });
        }
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await response.arrayBuffer());
        res.set('Content-Type', contentType);
        res.send(buffer);
    } catch (error) {
        console.error('Get product image error:', error);
        res.status(503).json({ error: 'Service unavailable' });
    }
};

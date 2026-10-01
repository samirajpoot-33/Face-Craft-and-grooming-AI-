/**
 * Express Application Setup
 *
 * This file configures the Express app with middleware and routes
 * It's separate from server.js to allow testing and better organization
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import faceAnalysisRoutes from "./routes/faceAnalysisRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import oauthCallbackRoutes from "./routes/oauthCallbackRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import makeupTryOnRoutes from "./routes/makeupTryOnRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import hairstyleTryOnRoutes from "./routes/hairstyleTryOnRoutes.js";
import beardTryOnRoutes from "./routes/beardTryOnRoutes.js";

// Load environment variables
dotenv.config();

// Debug: Check if env vars are present (only log in non-prod or if missing)
if (!process.env.DB_HOST) {
  console.error("⚠️ CRITICAL: DB_HOST is missing from environment variables!");
}

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

/**
 * CORS (Cross-Origin Resource Sharing)
 * Allows frontend (React) to make requests to backend
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

/**
 * Body Parser Middleware
 * Parses JSON request bodies
 */
app.use(express.json());

/**
 * URL Encoded Middleware
 * Parses form data
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Serve uploaded files statically
 * This allows frontend to access uploaded images
 * Note: On Vercel, file uploads won't persist, but this won't cause errors
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel (serverless), we must use /tmp for any writes
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const uploadsBase = isVercel
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "uploads");

// Ensure upload folders exist
try {
  const uploadDirs = [
    path.join(uploadsBase, "face-analysis"),
    path.join(uploadsBase, "face-analysis", "annotated"),
    path.join(uploadsBase, "makeup-virtual-try"),
  ];
  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
} catch (err) {
  console.warn(
    "⚠️ Could not create upload directories (expected on Vercel):",
    err.message
  );
}

// Only serve static files if not on Vercel (serverless)
if (!isVercel) {
  app.use("/uploads", express.static(uploadsBase));
}

// ============================================
// ROUTES
// ============================================

/**
 * Health Check Route
 * Test if server is running
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FaceCraft & Grooming AI Backend API",
    version: "1.0.0",
    status: "Server is running!",
  });
});

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/face-analysis", faceAnalysisRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/ai", chatbotRoutes);
app.use("/api/makeup-tryon", makeupTryOnRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/hairstyle-tryon", hairstyleTryOnRoutes);
app.use("/api/beard-tryon", beardTryOnRoutes);

/**
 * OAuth Callback Routes (must be before 404 handler)
 */
app.use("/auth", oauthCallbackRoutes);

/**
 * 404 Handler
 * Handle routes that don't exist
 */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Error Handler Middleware
 * Handles all errors thrown in the application
 */
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error: " + err.message,
    });
  }

  // File filter errors (from multer)
  if (err.message && err.message.includes("Only image files")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;

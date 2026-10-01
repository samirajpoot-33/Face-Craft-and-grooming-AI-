/**
 * Vercel Serverless Function Entry Point
 * 
 * Vercel's @vercel/node automatically handles Express apps
 * Just export the app directly
 */

import app from '../src/app.js';

// Export the Express app directly
// Vercel's @vercel/node builder will automatically wrap it
export default app;

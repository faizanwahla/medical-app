import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import Express app from server
import { app } from "../packages/server/dist/index.js";

/**
 * Vercel Serverless Function Handler
 * 
 * This function serves as the entry point for all API requests in Vercel.
 * It delegates to the Express app defined in packages/server/src/index.ts
 * 
 * Vercel automatically:
 * - Routes all /api/* requests here
 * - Provides req and res objects compatible with Express
 * - Manages cold starts and warm invocations
 * - Handles auto-scaling
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Log incoming request for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Delegate to Express app
  // Remove /api prefix since our routes don't expect it
  const originalUrl = req.url || "/";
  req.url = originalUrl.replace(/^\/api/, "") || "/";

  return app(req, res);
}

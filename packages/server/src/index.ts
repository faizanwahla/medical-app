import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import os from "os";

// Import routes
import authRoutes from "./modules/auth/routes.js";
import patientRoutes from "./modules/patients/routes.js";
import vitalsRoutes from "./modules/vitals/routes.js";
import investigationRoutes from "./modules/investigations/routes.js";
import treatmentRoutes from "./modules/treatments/routes.js";
import medicineRoutes from "./modules/medicines/routes.js";
import diagnosisRoutes from "./modules/diagnosis/routes.js";
import reportsRoutes from "./modules/reports/routes.js";
import notesRoutes from "./modules/notes/routes.js";
import symptomsRoutes from "./modules/symptoms/routes.js";
import signsRoutes from "./modules/signs/routes.js";

// Load environment variables
dotenv.config();

// Import AND export so it's available locally and to other modules
import { prisma } from "./lib/prisma.js";
export { prisma };

// Create Express app
const app = express();

/**
 * Utility to find local IPv4 address for local network testing.
 * Includes safety checks to prevent "Object is possibly undefined" errors.
 */
function getLocalIP() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const networkInterface = interfaces[name];
      if (!networkInterface) continue;

      for (const iface of networkInterface) {
        if (iface && iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (error) {
    console.error("Failed to detect local IP:", error);
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();
const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  `http://${LOCAL_IP}:3000`,
  `http://${LOCAL_IP}:3001`,
];
const LOCAL_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/;

// Middleware
app.use(helmet());

// CORS - configure allowed origins from env for Vercel/Production
const allowedOrigins =
  process.env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) || DEFAULT_CORS_ORIGINS;

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (!process.env.CORS_ORIGIN && LOCAL_DEV_ORIGIN.test(origin))
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Strict rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return !req.path.includes("/login") && !req.path.includes("/register");
  },
});

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/investigations", investigationRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/symptoms", symptomsRoutes);
app.use("/api/signs", signsRoutes);

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
let server: ReturnType<typeof app.listen> | undefined;

export const startServer = (port = Number(PORT)) => {
  if (server) {
    return server;
  }

  // Bind to 0.0.0.0 for local network access; Vercel handles its own binding
  server = app.listen(port, "0.0.0.0", () => {
    console.log(`Medical App Server running on port ${port}`);
  });

  return server;
};

// ESM replacement for require.main === module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule || process.env.NODE_ENV === 'production') {
  startServer();
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
});

export { app };
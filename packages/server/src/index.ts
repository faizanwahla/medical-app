import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Import routes
import authRoutes from "./modules/auth/routes";
import patientRoutes from "./modules/patients/routes";
import vitalsRoutes from "./modules/vitals/routes";
import investigationRoutes from "./modules/investigations/routes";
import treatmentRoutes from "./modules/treatments/routes";
import medicineRoutes from "./modules/medicines/routes";
import diagnosisRoutes from "./modules/diagnosis/routes";
import reportsRoutes from "./modules/reports/routes";

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient();

// Create Express app
const app = express();

// Middleware
// Security headers
app.use(helmet());

// CORS - configure allowed origins from env
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"];
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/investigations", investigationRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use("/api/reports", reportsRoutes);

// Error handling middleware
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏥 Medical App Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

export { app };

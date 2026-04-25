import express from "express";
import cors from "cors";
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

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

export { app };

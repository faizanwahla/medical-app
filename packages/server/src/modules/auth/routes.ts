import { Router, Request, Response } from "express";
import { prisma } from "../../index";
import { RegisterSchema, LoginSchema } from "@medical-app/shared";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../lib/auth";
import { handleError, ConflictError, ValidationError, UnauthorizedError } from "../../lib/errors";
import { AuthRequest, authMiddleware } from "../../middleware/auth";
import { createAuditLog } from "../../lib/audit";
import bcrypt from "bcryptjs";

const router = Router();

// Register endpoint
router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const input = RegisterSchema.parse(req.body);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        specialty: input.specialty,
        role: input.role as any,
      },
    });

    // Audit log
    await createAuditLog(
      user.id,
      "USER_REGISTER",
      "USER",
      user.id,
      `User registered with role ${user.role}`,
      req.ip
    );

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role, user.specialty);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role, user.specialty);

    // Persist refresh token (hashed) for revocation
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt: refreshExpiresAt,
        consumed: false,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          specialty: user.specialty,
          role: user.role,
        },
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Login endpoint
router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const input = LoginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check password
    const passwordMatch = await comparePassword(input.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Audit log
    await createAuditLog(
      user.id,
      "USER_LOGIN",
      "USER",
      user.id,
      "User logged in",
      req.ip
    );

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role, user.specialty);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role, user.specialty);

    // Persist refresh token (hashed) for revocation
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt: refreshExpiresAt,
        consumed: false,
      },
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          specialty: user.specialty,
          role: user.role,
        },
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        specialty: user.specialty,
        role: user.role,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Refresh token endpoint
router.post("/refresh", async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    // Verify and decode refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Check if refresh token exists and is not consumed/expired
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
        consumed: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!tokenRecord) {
      throw new UnauthorizedError("Refresh token not found or expired");
    }

    // Verify token hash matches
    const tokenHashMatch = await bcrypt.compare(refreshToken, tokenRecord.tokenHash);
    if (!tokenHashMatch) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.role, user.specialty);

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken(user.id, user.email, user.role, user.specialty);

    // Persist new refresh token
    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    const newRefreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshHash,
        expiresAt: newRefreshExpiresAt,
        consumed: false,
      },
    });

    // Optionally mark old token as consumed
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { consumed: true },
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Logout endpoint (revoke refresh token)
router.post("/logout", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const { refreshToken } = req.body;

    if (refreshToken) {
      // Mark all refresh tokens as consumed for this user
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.userId },
        data: { consumed: true },
      });

      // Audit log
      await createAuditLog(
        req.user.userId,
        "USER_LOGOUT",
        "USER",
        req.user.userId,
        "User logged out",
        req.ip
      );
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;

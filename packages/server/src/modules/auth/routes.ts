import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { RegisterSchema, LoginSchema } from "@medical-app/shared";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../../lib/auth";
import { handleError, ConflictError, ValidationError, UnauthorizedError } from "../../lib/errors";
import { AuthRequest } from "../../middleware/auth";

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
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.specialty);
    const refreshToken = generateRefreshToken(user.id, user.email, user.specialty);

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          specialty: user.specialty,
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

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.specialty);
    const refreshToken = generateRefreshToken(user.id, user.email, user.specialty);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          specialty: user.specialty,
        },
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get current user
router.get("/me", async (req: AuthRequest, res: Response) => {
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
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;

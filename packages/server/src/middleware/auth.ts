import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JWTPayload } from "../lib/auth";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

export const roleCheck = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Insufficient permissions",
      });
    }

    next();
  };
};

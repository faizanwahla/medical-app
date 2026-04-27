import { Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "@medical-app/shared";

export const handleError = (error: any, res: Response) => {
  // Zod validation error
  if (error instanceof ZodError) {
    console.error("ZOD VALIDATION ERROR:", JSON.stringify(error.errors, null, 2));
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: error.errors,
    });
  }

  // Custom API error
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // Default error
  console.error("Unexpected error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

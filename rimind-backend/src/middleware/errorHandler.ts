/**
 * Global error handler — catches errors from route handlers and sends consistent JSON.
 */

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/responseFormatter";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    const message = err.flatten().fieldErrors
      ? Object.entries(err.flatten().fieldErrors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ")
      : "Validation failed";
    sendError(res, message, 400, "VALIDATION_ERROR");
    return;
  }

  if (err instanceof AppError) {
    logger.warn("AppError", { message: err.message, statusCode: err.statusCode, code: err.code });
    sendError(res, err.message, err.statusCode, err.code);
    return;
  }

  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  sendError(res, process.env.NODE_ENV === "production" ? "Internal server error" : err.message, 500);
};

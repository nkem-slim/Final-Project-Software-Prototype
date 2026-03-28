import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/responseFormatter";
import { AppError } from "./errorHandler";
import type { Role } from "@prisma/client";

export type JwtPayload = {
  userId: string;
  role: Role;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    sendError(res, "Authentication required", 401, "UNAUTHORIZED");
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type !== "access") {
      sendError(res, "Invalid token type", 401, "UNAUTHORIZED");
      return;
    }
    req.user = decoded;
    next();
  } catch {
    sendError(res, "Invalid or expired token", 401, "UNAUTHORIZED");
  }
};

// Optional auth: set req.user if valid token present; never reject (for public endpoints like AI ask).
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    next();
    return;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type === "access") req.user = decoded;
  } catch {
    console.error("Invalid or expired token");
  }
  next();
};

export const requireRole =
  (roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required", 401, "UNAUTHORIZED");
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, "Insufficient permissions", 403, "FORBIDDEN");
      return;
    }
    next();
  };

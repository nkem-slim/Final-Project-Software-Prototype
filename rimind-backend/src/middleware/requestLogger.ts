/**
 * Request logging middleware — logs method, path, status, duration.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: duration,
    });
  });
  next();
};

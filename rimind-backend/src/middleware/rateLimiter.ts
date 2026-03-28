import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/responseFormatter";

const windowMs = 60 * 1000;
const maxPerWindow = 10;
const store = new Map<string, { count: number; resetAt: number }>();

const getClientKey = (req: Request): string =>
  (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
  req.socket.remoteAddress ||
  "unknown";

export const aiRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const key = getClientKey(req);
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
  } else if (now >= entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
  } else {
    entry.count += 1;
  }

  if (entry.count > maxPerWindow) {
    sendError(
      res,
      "Too many requests. Please try again in a minute.",
      429,
      "RATE_LIMITED",
    );
    return;
  }

  next();
};

import { Request, Response, NextFunction } from "express";
import { syncService } from "../services/syncService";
import { sendSuccess } from "../utils/responseFormatter";

const sync = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const log = await syncService.recordSync({
      userId: req.user.userId,
      deviceId: req.body.deviceId,
      recordCount: req.body.recordCount ?? 0,
      status: req.body.status ?? "SUCCESS",
    });
    sendSuccess(res, log, 201);
  } catch (e) {
    next(e);
  }
};

const getStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const logs = await syncService.getStatusByDevice(req.params.deviceId);
    sendSuccess(res, logs);
  } catch (e) {
    next(e);
  }
};

export const syncController = { sync, getStatus };

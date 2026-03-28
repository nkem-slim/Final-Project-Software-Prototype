import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/aiService";
import { sendSuccess } from "../utils/responseFormatter";

const ask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId ?? null;
    const result = await aiService.ask({
      question: req.body.question,
      userId,
      context: req.body.context,
    });
    sendSuccess(res, result);
  } catch (e) {
    next(e);
  }
};

const getHistoryMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const list = await aiService.getHistoryByUserId(req.user.userId);
    sendSuccess(res, list);
  } catch (e) {
    next(e);
  }
};

export const aiController = { ask, getHistoryMe };

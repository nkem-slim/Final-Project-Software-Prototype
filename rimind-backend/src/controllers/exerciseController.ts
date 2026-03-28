import { Request, Response, NextFunction } from "express";
import { exerciseService } from "../services/exerciseService";
import { sendSuccess } from "../utils/responseFormatter";

const getByStage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stage = req.params.stage as "PRENATAL" | "POSTNATAL";
    const plans = await exerciseService.getByStage(stage);
    sendSuccess(res, plans);
  } catch (e) {
    next(e);
  }
};

const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const plan = await exerciseService.create({
      userId: req.user.userId,
      stage: req.body.stage,
      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      source: req.body.source ?? null,
    });
    sendSuccess(res, plan, 201);
  } catch (e) {
    next(e);
  }
};

export const exerciseController = { getByStage, create };

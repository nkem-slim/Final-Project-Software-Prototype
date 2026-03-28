/**
 * Pregnancy controller — thin; delegates to pregnancyService.
 */

import { Request, Response, NextFunction } from "express";
import { pregnancyService } from "../services/pregnancyService";
import { sendSuccess } from "../utils/responseFormatter";

const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const record = await pregnancyService.create({
      userId: req.user.userId,
      expectedDeliveryDate: req.body.expectedDeliveryDate instanceof Date ? req.body.expectedDeliveryDate : new Date(req.body.expectedDeliveryDate),
      trimester: req.body.trimester,
    });
    sendSuccess(res, record, 201);
  } catch (e) {
    next(e);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const records = await pregnancyService.getMyRecords(req.user.userId);
    sendSuccess(res, records);
  } catch (e) {
    next(e);
  }
};

const getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await pregnancyService.getByUserId(req.params.userId, req.user!.role);
    sendSuccess(res, records);
  } catch (e) {
    next(e);
  }
};

const updateHealthNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const updated = await pregnancyService.updateHealthNotes({
      pregnancyRecordId: req.params.id,
      healthNotes: req.body.healthNotes ?? null,
      updatedByUserId: req.user.userId,
      updatedByRole: req.user.role,
    });
    sendSuccess(res, updated);
  } catch (e) {
    next(e);
  }
};

const updateEdd = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const updated = await pregnancyService.updateEdd({
      pregnancyRecordId: req.params.id,
      expectedDeliveryDate:
        req.body.expectedDeliveryDate instanceof Date
          ? req.body.expectedDeliveryDate
          : new Date(req.body.expectedDeliveryDate),
      updatedByUserId: req.user.userId,
      updatedByRole: req.user.role,
    });
    sendSuccess(res, updated);
  } catch (e) {
    next(e);
  }
};

const deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    await pregnancyService.delete({
      pregnancyRecordId: req.params.id,
      requestedByUserId: req.user.userId,
      requestedByRole: req.user.role,
    });
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
};

export const pregnancyController = {
  create,
  getMe,
  getByUserId,
  updateHealthNotes,
  updateEdd,
  deleteRecord,
};

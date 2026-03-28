/**
 * Reminder controller — thin; delegates to reminderService.
 */

import { Request, Response, NextFunction } from "express";
import { reminderService } from "../services/reminderService";
import { pregnancyRecordRepository } from "../repositories/pregnancyRecordRepository";
import { sendSuccess } from "../utils/responseFormatter";

const generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { pregnancyRecordId } = req.body as { pregnancyRecordId: string };
    const record = await pregnancyRecordRepository.findById(pregnancyRecordId);
    if (!record) {
      next(new Error("Pregnancy record not found"));
      return;
    }
    const result = await reminderService.generateForPregnancyRecord({
      userId: record.userId,
      expectedDeliveryDate: record.expectedDeliveryDate,
      trimester: record.trimester,
      createdAt: record.createdAt,
    });
    sendSuccess(res, result, 201);
  } catch (e) {
    next(e);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const reminders = await reminderService.getForUser(req.user.userId);
    sendSuccess(res, reminders);
  } catch (e) {
    next(e);
  }
};

const getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reminders = await reminderService.getForUser(req.params.userId);
    sendSuccess(res, reminders);
  } catch (e) {
    next(e);
  }
};

const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await reminderService.updateStatus(req.params.id, req.body.status);
    sendSuccess(res, updated);
  } catch (e) {
    next(e);
  }
};

const send = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, message, scheduledDate } = req.body as {
      userId: string;
      message: string;
      scheduledDate?: string;
    };
    const created = await reminderService.sendByAdmin({
      userId,
      message,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
    });
    sendSuccess(res, created, 201);
  } catch (e) {
    next(e);
  }
};

const markAsDone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const updated = await reminderService.markAsDone(req.params.id, req.user);
    sendSuccess(res, updated);
  } catch (e) {
    next(e);
  }
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    const deleted = await reminderService.delete(req.params.id, req.user);
    sendSuccess(res, deleted);
  } catch (e) {
    next(e);
  }
};

export const reminderController = {
  generate,
  getMe,
  getByUserId,
  updateStatus,
  send,
  markAsDone,
  remove,
};

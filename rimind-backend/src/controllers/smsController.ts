/**
 * SMS controller — internal trigger for reminder dispatch.
 */

import { Request, Response, NextFunction } from "express";
import { smsService } from "../services/smsService";
import { sendSuccess } from "../utils/responseFormatter";

const send = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reminderId } = req.body as { reminderId: string };
    const result = await smsService.sendReminder(reminderId);
    sendSuccess(res, result);
  } catch (e) {
    next(e);
  }
};

export const smsController = { send };

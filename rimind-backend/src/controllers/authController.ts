/**
 * Auth controller — thin layer; delegates to authService.
 */

import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { sendSuccess } from "../utils/responseFormatter";

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  } catch (e) {
    next(e);
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (e) {
    next(e);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new Error("requireAuth must be applied before getMe"));
      return;
    }
    const user = await authService.getMe(req.user.userId);
    sendSuccess(res, user);
  } catch (e) {
    next(e);
  }
};

const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(new Error("requireAuth must be applied before updateMe"));
      return;
    }
    const user = await authService.updateMe({
      userId: req.user.userId,
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
    });
    sendSuccess(res, user);
  } catch (e) {
    next(e);
  }
};

export const authController = { register, login, getMe, updateMe };

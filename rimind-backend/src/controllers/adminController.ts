import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/adminService";
import { sendSuccess } from "../utils/responseFormatter";

const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await adminService.getUsers();
    sendSuccess(res, users);
  } catch (e) {
    next(e);
  }
};

const getReports = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reports = await adminService.getReports();
    sendSuccess(res, reports);
  } catch (e) {
    next(e);
  }
};

const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) return next(new Error("requireAuth required"));
    await adminService.deleteUser(req.params.id, req.user.userId);
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
};

export const adminController = { getUsers, getReports, deleteUser };

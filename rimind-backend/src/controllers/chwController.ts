import { Request, Response, NextFunction } from "express";
import { chwService } from "../services/chwService";
import { sendSuccess } from "../utils/responseFormatter";

const getPatients = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const patients = await chwService.getPatients();
    sendSuccess(res, patients);
  } catch (e) {
    next(e);
  }
};

export const chwController = { getPatients };

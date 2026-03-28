/**
 * Standard API response helpers — consistent shape for success and error.
 */

import { Response } from "express";

export type SuccessPayload<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type ErrorPayload = {
  success: false;
  error: string;
  code?: string;
};

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string): void => {
  const payload: SuccessPayload<T> = { success: true, data, ...(message && { message }) };
  res.status(statusCode).json(payload);
};

export const sendError = (res: Response, error: string, statusCode = 500, code?: string): void => {
  const payload: ErrorPayload = { success: false, error, ...(code && { code }) };
  res.status(statusCode).json(payload);
};

/**
 * SMS routes — FR6: internal trigger for reminder dispatch.
 */

import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { smsController } from "../controllers/smsController";

const router = Router();

const validate = (schema: z.ZodSchema) => (
  req: import("express").Request,
  _res: import("express").Response,
  next: import("express").NextFunction
) => {
  const result = schema.safeParse(req.body);
  if (!result.success) next(result.error);
  else {
    req.body = result.data;
    next();
  }
};

const sendSchema = z.object({
  reminderId: z.string().uuid(),
});

router.post("/send", requireAuth, requireRole(["ADMIN"]), validate(sendSchema), smsController.send);

export const smsRoutes = router;

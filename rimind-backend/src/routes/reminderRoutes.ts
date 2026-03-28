/**
 * Reminder routes — FR3: generate, get me, get by userId, patch status.
 */

import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { reminderController } from "../controllers/reminderController";

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

const generateSchema = z.object({
  pregnancyRecordId: z.string().uuid(),
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "SENT", "FAILED"]),
});

const sendSchema = z.object({
  userId: z.string().uuid(),
  message: z.string().trim().min(2),
  scheduledDate: z.string().datetime().optional(),
});

router.post(
  "/generate",
  requireAuth,
  requireRole(["ADMIN"]),
  validate(generateSchema),
  reminderController.generate
);
router.post(
  "/send",
  requireAuth,
  requireRole(["ADMIN"]),
  validate(sendSchema),
  reminderController.send
);
router.get(
  "/me",
  requireAuth,
  requireRole(["MOTHER", "HEALTH_WORKER", "ADMIN"]),
  reminderController.getMe
);
router.get(
  "/:userId",
  requireAuth,
  requireRole(["HEALTH_WORKER", "ADMIN"]),
  reminderController.getByUserId
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["ADMIN"]),
  validate(statusSchema),
  reminderController.updateStatus
);
router.patch(
  "/:id/done",
  requireAuth,
  requireRole(["ADMIN", "MOTHER", "HEALTH_WORKER"]),
  reminderController.markAsDone
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "MOTHER", "HEALTH_WORKER"]),
  reminderController.remove
);

export const reminderRoutes = router;

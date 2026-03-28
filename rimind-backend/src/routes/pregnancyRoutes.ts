/**
 * Pregnancy routes — FR2: create, get me, get by userId, update healthNotes.
 */

import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { pregnancyController } from "../controllers/pregnancyController";

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

const createSchema = z.object({
  expectedDeliveryDate: z.union([z.string(), z.date()]).transform((s) => (s instanceof Date ? s : new Date(s))),
  trimester: z.number().int().min(1).max(3).optional(),
});

const updateHealthNotesSchema = z.object({
  healthNotes: z.string().nullable().optional(),
});

const updateEddSchema = z.object({
  expectedDeliveryDate: z.union([z.string(), z.date()]).transform((s) =>
    s instanceof Date ? s : new Date(s),
  ),
});

router.post(
  "/",
  requireAuth,
  requireRole(["MOTHER"]),
  validate(createSchema),
  pregnancyController.create
);
router.get("/me", requireAuth, requireRole(["MOTHER"]), pregnancyController.getMe);
router.get(
  "/:userId",
  requireAuth,
  requireRole(["ADMIN", "HEALTH_WORKER"]),
  pregnancyController.getByUserId
);
router.put(
  "/:id",
  requireAuth,
  requireRole(["HEALTH_WORKER"]),
  validate(updateHealthNotesSchema),
  pregnancyController.updateHealthNotes
);

router.put(
  "/:id/edd",
  requireAuth,
  requireRole(["MOTHER", "HEALTH_WORKER", "ADMIN"]),
  validate(updateEddSchema),
  pregnancyController.updateEdd
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["MOTHER", "ADMIN"]),
  pregnancyController.deleteRecord
);

export const pregnancyRoutes = router;

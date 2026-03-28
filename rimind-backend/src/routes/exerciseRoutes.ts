import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { exerciseController } from "../controllers/exerciseController";

const router = Router();
const StageEnum = z.enum(["PRENATAL", "POSTNATAL"]);

const validateStage = (
  req: import("express").Request,
  _res: import("express").Response,
  next: import("express").NextFunction,
) => {
  const result = StageEnum.safeParse(req.params.stage);
  if (!result.success) next(result.error);
  else next();
};

const createSchema = z.object({
  stage: StageEnum,
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  duration: z.number().int().min(1).max(120),
  source: z.string().max(500).optional().nullable(),
});

const validate =
  (schema: z.ZodSchema) =>
  (
    req: import("express").Request,
    _res: import("express").Response,
    next: import("express").NextFunction,
  ) => {
    const result = schema.safeParse(req.body);
    if (!result.success) next(result.error);
    else {
      req.body = result.data;
      next();
    }
  };

router.get("/:stage", validateStage, exerciseController.getByStage);
router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "HEALTH_WORKER"]),
  validate(createSchema),
  exerciseController.create,
);

export const exerciseRoutes = router;

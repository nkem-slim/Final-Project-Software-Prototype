import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { syncController } from "../controllers/syncController";

const router = Router();

const syncSchema = z.object({
  deviceId: z.string().min(1, "deviceId is required"),
  recordCount: z.number().int().min(0).default(0),
  status: z.enum(["SUCCESS", "PARTIAL", "FAILED"]).default("SUCCESS"),
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

router.post("/", requireAuth, validate(syncSchema), syncController.sync);
router.get("/status/:deviceId", requireAuth, syncController.getStatus);

export const syncRoutes = router;

import { Router } from "express";
import { z } from "zod";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { aiController } from "../controllers/aiController";

const router = Router();

const validateAsk = (
  req: import("express").Request,
  _res: import("express").Response,
  next: import("express").NextFunction,
) => {
  const schema = z.object({
    question: z.string().min(1, "Question is required").max(2000),
    context: z.string().max(500).optional(),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) next(result.error);
  else {
    req.body = result.data;
    next();
  }
};

router.post("/ask", aiRateLimiter, optionalAuth, validateAsk, aiController.ask);
router.get("/history/me", requireAuth, aiController.getHistoryMe);

export const aiRoutes = router;

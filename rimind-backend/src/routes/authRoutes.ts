/**
 * Auth routes — FR1: register, login, me.
 */

import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { authController } from "../controllers/authController";

const router = Router();

const RoleEnum = z.enum(["MOTHER", "HEALTH_WORKER"]);

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: RoleEnum.default("MOTHER"),
  country: z.enum(["Rwanda", "Uganda", "Nigeria", "Kenya"]),
  regionLevel1: z.string().min(1, "Primary location is required"),
  regionLevel2: z.string().min(1, "Secondary location is required"),
});

const loginSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

const updateMeSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  phoneNumber: z.string().min(1, "Phone number is required").optional(),
  country: z.enum(["Rwanda", "Uganda", "Nigeria", "Kenya"]).optional(),
  regionLevel1: z.string().min(1).optional(),
  regionLevel2: z.string().min(1).optional(),
});

const validate = (schema: z.ZodSchema) => (req: import("express").Request, _res: import("express").Response, next: import("express").NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) next(result.error);
  else {
    req.body = result.data;
    next();
  }
};

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", requireAuth, authController.getMe);
router.put("/me", requireAuth, validate(updateMeSchema), authController.updateMe);

export const authRoutes = router;

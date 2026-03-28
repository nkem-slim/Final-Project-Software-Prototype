import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { chwController } from "../controllers/chwController";

const router = Router();

router.get(
  "/patients",
  requireAuth,
  requireRole(["HEALTH_WORKER"]),
  chwController.getPatients,
);

export const chwRoutes = router;

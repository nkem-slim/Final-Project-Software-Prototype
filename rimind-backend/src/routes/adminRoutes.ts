import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { adminController } from "../controllers/adminController";

const router = Router();

router.get(
  "/users",
  requireAuth,
  requireRole(["ADMIN"]),
  adminController.getUsers,
);
router.get(
  "/reports",
  requireAuth,
  requireRole(["ADMIN"]),
  adminController.getReports,
);
router.delete(
  "/users/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  adminController.deleteUser,
);

export const adminRoutes = router;

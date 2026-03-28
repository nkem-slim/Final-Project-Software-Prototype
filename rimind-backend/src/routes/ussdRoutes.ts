/**
 * USSD routes — FR6: public callback for Africa's Talking (stateless menu).
 */

import { Router } from "express";
import { ussdController } from "../controllers/ussdController";

const router = Router();

// Africa's Talking may send application/x-www-form-urlencoded or JSON
router.post("/", ussdController.handleUssd);
router.get("/", ussdController.handleUssd);

export const ussdRoutes = router;

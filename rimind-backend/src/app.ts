import express from "express";
import cors from "cors";
import path from "path";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { exerciseRoutes } from "./routes/exerciseRoutes";
import { pregnancyRoutes } from "./routes/pregnancyRoutes";
import { reminderRoutes } from "./routes/reminderRoutes";
import { smsRoutes } from "./routes/smsRoutes";
import { ussdRoutes } from "./routes/ussdRoutes";
import { aiRoutes } from "./routes/aiRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { chwRoutes } from "./routes/chwRoutes";
import { syncRoutes } from "./routes/syncRoutes";

export const createApp = (): express.Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  const openapiPath = path.join(__dirname, "../openapi.yaml");
  const swaggerDocument = YAML.load(openapiPath);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/exercise", exerciseRoutes);
  app.use("/api/pregnancy", pregnancyRoutes);
  app.use("/api/reminders", reminderRoutes);
  app.use("/api/sms", smsRoutes);
  app.use("/api/ussd", ussdRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/chw", chwRoutes);
  app.use("/api/sync", syncRoutes);

  app.use(errorHandler);
  return app;
};

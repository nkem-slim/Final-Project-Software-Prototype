/**
 * Server entry — load config, create app, listen.
 */

import { createApp } from "./app";
import { env, prisma } from "./config";
import { getAiProvider } from "./services/ai";
import { logger } from "./utils/logger";

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connected");
  } catch (e) {
    logger.error("Database connection failed", { error: String(e) });
    process.exit(1);
  }

  const aiProvider = getAiProvider();
  logger.info("AI provider at startup", {
    configured: !!aiProvider,
    provider: env.AI_PROVIDER,
    hasAnthropicKey: !!env.ANTHROPIC_API_KEY,
    hasOpenAiKey: !!env.OPENAI_API_KEY,
  });

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info("Server listening", { port: env.PORT, env: env.NODE_ENV });
  });
};

start().catch((e) => {
  logger.error("Server failed to start", { error: String(e) });
  process.exit(1);
});

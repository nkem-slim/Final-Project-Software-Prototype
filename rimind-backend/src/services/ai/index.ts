import { env } from "../../config/env";
import { createClaudeProvider } from "./claudeProvider";
import { createOpenAiProvider } from "./openaiProvider";
import type { IAiService } from "./types";

let cachedProvider: IAiService | null = null;

export const getAiProvider = (): IAiService | null => {
  if (cachedProvider) return cachedProvider;
  if (env.AI_PROVIDER === "anthropic" && env.ANTHROPIC_API_KEY) {
    cachedProvider = createClaudeProvider();
    return cachedProvider;
  }
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    cachedProvider = createOpenAiProvider();
    return cachedProvider;
  }
  return null;
};

/**
 * Environment configuration — validated at startup.
 * Load dotenv via config/index.ts before importing this.
 */

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().transform(Number).default("4000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("24h"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),
  // Sprint 3: Africa's Talking (optional — SMS falls back to stub if missing)
  AFRICAS_TALKING_API_KEY: z.string().optional().default(""),
  AFRICAS_TALKING_USERNAME: z.string().optional().default(""),
  AFRICAS_TALKING_BASE_URL: z.string().optional().default("https://api.sandbox.africastalking.com"),
  SMS_SENDER_ID: z.string().optional().default(""),
  // Sprint 4: AI Virtual Doctor (swappable provider)
  AI_PROVIDER: z.enum(["anthropic", "openai"]).optional().default("anthropic"),
  ANTHROPIC_API_KEY: z.string().optional().transform((s) => (s ?? "").trim()).default(""),
  OPENAI_API_KEY: z.string().optional().transform((s) => (s ?? "").trim()).default(""),
  AI_MODEL_ANTHROPIC: z.string().optional().default("claude-haiku-4-5"),
  AI_MODEL_OPENAI: z.string().optional().default("gpt-4o-mini"),
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.flatten().fieldErrors;
    const formatted = Object.entries(messages)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("; ");
    throw new Error(`Invalid environment: ${formatted}`);
  }
  return result.data;
};

export const env = parseEnv();

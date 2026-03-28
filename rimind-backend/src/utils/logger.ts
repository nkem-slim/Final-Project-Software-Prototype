/**
 * Structured request/application logging.
 * Can be replaced with Winston/Pino later; minimal implementation for Sprint 1.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const log = (level: LogLevel, message: string, meta?: Record<string, unknown>): void => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && Object.keys(meta).length > 0 && { meta }),
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
};

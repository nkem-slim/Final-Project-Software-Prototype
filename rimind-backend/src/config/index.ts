/**
 * Config barrel — load env before anything else.
 */
import "dotenv/config";
export { env } from "./env";
export { prisma } from "./database";

import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/env";
import { AI_SYSTEM_PROMPT } from "./systemPrompt";
import type { IAiService } from "./types";

const getClient = (): Anthropic => {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
};

export const createClaudeProvider = (): IAiService => ({
  ask: async (question: string, context?: string): Promise<string> => {
    const client = getClient();
    const userContent = context
      ? `Context: ${context}\n\nQuestion: ${question}`
      : question;
    const response = await client.messages.create({
      model: env.AI_MODEL_ANTHROPIC,
      max_tokens: 1024,
      system: AI_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in Claude response");
    }
    return textBlock.text;
  },
});

import OpenAI from "openai";
import { env } from "../../config/env";
import { AI_SYSTEM_PROMPT } from "./systemPrompt";
import type { IAiService } from "./types";

const getClient = (): OpenAI => {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
};

export const createOpenAiProvider = (): IAiService => ({
  ask: async (question: string, context?: string): Promise<string> => {
    const client = getClient();
    const userContent = context
      ? `Context: ${context}\n\nQuestion: ${question}`
      : question;
    const response = await client.chat.completions.create({
      model: env.AI_MODEL_OPENAI,
      max_tokens: 1024,
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }
    return content;
  },
});

import { getAiProvider } from "./ai/index";
import { aiConsultationRepository } from "../repositories/aiConsultationRepository";
import { sanitiseAiResponse } from "../utils/responseSanitiser";
import { AI_FALLBACK_RESPONSE } from "../utils/aiFallback";
import { logger } from "../utils/logger";

const DISCLAIMER =
  "This guidance is not a medical diagnosis. Please consult a qualified health professional.";

const HIGH_RISK_PHRASES = [
  /bleeding|severe pain|can't feel (baby )?moving|high fever|fits|convulsion|unconscious|emergency/i,
];
const IMMEDIATE_CARE_PREFIX =
  "If you or your baby are in danger, go to your nearest clinic or hospital now. ";

const isHighRiskInput = (question: string): boolean =>
  HIGH_RISK_PHRASES.some((p) => p.test(question));

export type AskInput = {
  question: string;
  userId?: string | null;
  context?: string;
};

export type AskResult = {
  response: string;
  disclaimer: string;
};

export const aiService = {
  ask: async (input: AskInput): Promise<AskResult> => {
    const provider = getAiProvider();
    let rawResponse: string;

    try {
      if (!provider) {
        logger.warn("AI provider not configured; returning fallback");
        rawResponse = AI_FALLBACK_RESPONSE;
      } else {
        rawResponse = await provider.ask(input.question, input.context);
      }
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { status?: number; data?: unknown } };
      logger.error("AI provider error", {
        message: err?.message ?? String(e),
        status: err?.response?.status,
        data: err?.response?.data,
      });
      rawResponse = AI_FALLBACK_RESPONSE;
    }

    const sanitised = sanitiseAiResponse(rawResponse);
    const withUrgency =
      isHighRiskInput(input.question) && rawResponse !== AI_FALLBACK_RESPONSE
        ? IMMEDIATE_CARE_PREFIX + sanitised
        : sanitised;

    const consultation = await aiConsultationRepository.create({
      userId: input.userId ?? null,
      question: input.question,
      response: withUrgency,
      disclaimer: DISCLAIMER,
    });

    return {
      response: consultation.response,
      disclaimer: consultation.disclaimer,
    };
  },

  getHistoryByUserId: (userId: string) =>
    aiConsultationRepository.findByUserId(userId),
};

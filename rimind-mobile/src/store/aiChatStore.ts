import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export type Consultation = {
  id?: string;
  question: string;
  response: string;
  disclaimer: string;
  createdAt?: string;
  /** When true, Chat UI hides the user prompt (e.g. Home / Health routine requests). */
  hideQuestion?: boolean;
};

const CACHE_KEY_PREFIX = "@rimind/aiHistory";

const getCacheKey = (userId: string | null): string =>
  userId ? `${CACHE_KEY_PREFIX}:${userId}` : `${CACHE_KEY_PREFIX}:anonymous`;

/** Coach-style prompts used by exercise stores — hide in Chat so only the answer shows. */
export const isRoutineStyleAiPrompt = (question: string): boolean => {
  const q = (question ?? "").trim();
  if (q.startsWith("You are a gentle exercise coach for pregnant mothers")) {
    return true;
  }
  if (q.startsWith("You are a gentle exercise coach. The user is a pregnant mother")) {
    return true;
  }
  if (
    q.startsWith("You are a gentle exercise coach. The user is a mother") &&
    q.includes("recently delivered")
  ) {
    return true;
  }
  return false;
};

const normalizeConsultationForUi = (item: Consultation): Consultation => {
  const hide =
    Boolean(item.hideQuestion) || isRoutineStyleAiPrompt(item.question ?? "");
  if (!hide) return item;
  return {
    ...item,
    hideQuestion: true,
    question: "",
  };
};

const normalizeHistoryList = (raw: unknown): Consultation[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeConsultationForUi(item as Consultation));
};

/** Build context string from last N Q&A for the AI (max ~500 chars as per API). */
const buildContextFromHistory = (history: Consultation[], maxLength = 450): string => {
  if (history.length === 0) return "";
  const parts: string[] = [];
  let len = 0;
  const take = Math.min(history.length, 3);
  for (let i = 0; i < take && len < maxLength; i++) {
    const h = history[i];
    const hasQ = h.question?.trim().length && !h.hideQuestion;
    const qPart = hasQ ? `Q: ${h.question} ` : "";
    const s = `${qPart}A: ${h.response.slice(0, 120)}${h.response.length > 120 ? "…" : ""}`;
    if (len + s.length > maxLength) break;
    parts.push(s);
    len += s.length;
  }
  return parts.length === 0 ? "" : `Previous: ${parts.join(" ")}`;
};

export type AskOptions = {
  hideQuestionInUi?: boolean;
};

type AiChatState = {
  history: Consultation[];
  ask: (
    question: string,
    token: string | null,
    userId: string | null,
    options?: AskOptions,
  ) => Promise<{ response: string; disclaimer: string }>;
  fetchHistory: (userId: string | null) => Promise<void>;
  clearHistory: () => void;
};

export const useAiChatStore = create<AiChatState>((set, get) => ({
  history: [],

  ask: async (question, token, userId, options) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const context = buildContextFromHistory(get().history);
    const body = context ? { question, context } : { question };
    const { data } = await api.post<{
      data: { response: string; disclaimer: string };
    }>("/ai/ask", body, { headers });
    const result =
      data.data ??
      (data as unknown as { response: string; disclaimer: string });
    const hideUi =
      Boolean(options?.hideQuestionInUi) || isRoutineStyleAiPrompt(question);
    const entry: Consultation = {
      question: hideUi ? "" : question,
      response: result.response,
      disclaimer: result.disclaimer,
      hideQuestion: hideUi ? true : undefined,
    };
    const cacheKey = getCacheKey(userId);
    set((s) => {
      const next = [entry, ...s.history];
      AsyncStorage.setItem(cacheKey, JSON.stringify(next));
      return { history: next };
    });
    return { response: result.response, disclaimer: result.disclaimer };
  },

  fetchHistory: async (userId) => {
    if (!userId) {
      const cacheKey = getCacheKey(null);
      const cached = await AsyncStorage.getItem(cacheKey).then((s) =>
        s ? JSON.parse(s) : [],
      );
      const list = normalizeHistoryList(cached);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(list));
      set({ history: list });
      return;
    }
    const cacheKey = getCacheKey(userId);
    try {
      const { data } = await api.get<{ data: Consultation[] }>(
        "/ai/history/me",
      );
      const raw = data.data ?? data;
      const list = normalizeHistoryList(raw);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(list));
      set({ history: list });
    } catch {
      const cached = await AsyncStorage.getItem(cacheKey).then((s) =>
        s ? JSON.parse(s) : [],
      );
      const list = normalizeHistoryList(cached);
      set({ history: list });
    }
  },

  clearHistory: () => set({ history: [] }),
}));

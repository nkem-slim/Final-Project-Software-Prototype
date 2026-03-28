import { create } from "zustand";
import { storage } from "../utils/storage";
import { STORAGE_KEYS } from "../utils/constants";
import { useAiChatStore } from "./aiChatStore";

type ExerciseCache = {
  homeRoutine?: string | null;
  homeEddLabel?: string | null;
  homeDaysToEdd?: number | null;
  prenatal?: string | null;
  postnatal?: string | null;
  updatedAt?: string;
};

type ExerciseState = {
  homeRoutine: string | null;
  homeEddLabel: string | null;
  homeDaysToEdd: number | null;
  prenatal: string | null;
  postnatal: string | null;
  loadingHome: boolean;
  loadingPrenatal: boolean;
  loadingPostnatal: boolean;
  hydrate: (userId: string | null) => Promise<void>;
  refreshHome: (args: {
    userId: string;
    userName?: string | null;
    eddIso: string;
    daysToEdd: number | null;
    todayLabel: string;
    token: string | null;
  }) => Promise<void>;
  refreshPrenatal: (args: {
    userId: string;
    userName?: string | null;
    token: string | null;
  }) => Promise<void>;
  refreshPostnatal: (args: {
    userId: string;
    userName?: string | null;
    token: string | null;
  }) => Promise<void>;
};

const getCacheKey = (userId: string | null): string =>
  `${STORAGE_KEYS.EXERCISE_PLANS}:${userId ?? "anonymous"}`;

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  homeRoutine: null,
  homeEddLabel: null,
  homeDaysToEdd: null,
  prenatal: null,
  postnatal: null,
  loadingHome: false,
  loadingPrenatal: false,
  loadingPostnatal: false,

  hydrate: async (userId) => {
    const key = getCacheKey(userId);
    const cached = await storage.getItem<ExerciseCache>(key);
    if (!cached) return;
    set({
      homeRoutine: cached.homeRoutine ?? null,
      homeEddLabel: cached.homeEddLabel ?? null,
      homeDaysToEdd: cached.homeDaysToEdd ?? null,
      prenatal: cached.prenatal ?? null,
      postnatal: cached.postnatal ?? null,
    });
  },

  refreshHome: async ({
    userId,
    userName,
    eddIso,
    daysToEdd,
    todayLabel,
    token,
  }) => {
    if (!userId) return;
    const { ask } = useAiChatStore.getState();
    set({ loadingHome: true });
    try {
      const friendlyName = userName ? ` named ${userName}` : "";
      const question = `You are a gentle exercise coach for pregnant mothers. The user is a mother${friendlyName} with an expected delivery date of ${eddIso}. Today is ${todayLabel}. They are about ${daysToEdd ?? "?"} days from delivery. Provide a short, safe exercise routine that can help during labour. Use clear bullet points, 5–7 items, very simple language suitable for a low-literacy setting. Avoid medical jargon and avoid anything unsafe in late pregnancy.`;
      const result = await ask(question, token, userId, { hideQuestionInUi: true });
      const text = result.response;
      set({
        homeRoutine: text,
        homeEddLabel: eddIso,
        homeDaysToEdd: daysToEdd ?? null,
      });
      const key = getCacheKey(userId);
      const cached = (await storage.getItem<ExerciseCache>(key)) ?? {};
      await storage.setItem(key, {
        ...cached,
        homeRoutine: text,
        homeEddLabel: eddIso,
        homeDaysToEdd: daysToEdd ?? null,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      set({ loadingHome: false });
    }
  },

  refreshPrenatal: async ({ userId, userName, token }) => {
    if (!userId) return;
    const { ask } = useAiChatStore.getState();
    set({ loadingPrenatal: true });
    try {
      const friendlyName = userName ? ` named ${userName}` : "";
      const question = `You are a gentle exercise coach. The user is a pregnant mother${friendlyName}. Provide a clear, safe PRENATAL exercise routine that she can follow most days. Use bullet points, 6–8 items, simple language, and focus on low-impact movements. Avoid high-risk activities and always remind her to stop if she feels unwell.`;
      const result = await ask(question, token, userId, { hideQuestionInUi: true });
      const text = result.response;
      set({ prenatal: text });
      const key = getCacheKey(userId);
      const cached = (await storage.getItem<ExerciseCache>(key)) ?? {};
      await storage.setItem(key, {
        ...cached,
        prenatal: text,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      set({ loadingPrenatal: false });
    }
  },

  refreshPostnatal: async ({ userId, userName, token }) => {
    if (!userId) return;
    const { ask } = useAiChatStore.getState();
    set({ loadingPostnatal: true });
    try {
      const friendlyName = userName ? ` named ${userName}` : "";
      const question = `You are a gentle exercise coach. The user is a mother${friendlyName} who has recently delivered her baby. Provide a safe POSTNATAL exercise routine to help her recover strength. Use bullet points, 6–8 items, very simple language, avoid anything that could harm a healing body, and remind her to get medical advice if she has pain or bleeding.`;
      const result = await ask(question, token, userId, { hideQuestionInUi: true });
      const text = result.response;
      set({ postnatal: text });
      const key = getCacheKey(userId);
      const cached = (await storage.getItem<ExerciseCache>(key)) ?? {};
      await storage.setItem(key, {
        ...cached,
        postnatal: text,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      set({ loadingPostnatal: false });
    }
  },
}));


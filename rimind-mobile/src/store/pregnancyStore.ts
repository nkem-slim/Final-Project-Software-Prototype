import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { STORAGE_KEYS } from "@/utils/constants";

export type PregnancyRecord = {
  id: string;
  userId: string;
  expectedDeliveryDate: string;
  trimester: number;
  healthNotes: string | null;
  createdAt: string;
};

const CACHE_KEY = STORAGE_KEYS.PREGNANCY_RECORDS;

type PregnancyState = {
  records: PregnancyRecord[];
  fetchMyRecords: () => Promise<void>;
  fetchRecordsForUser: (userId: string) => Promise<PregnancyRecord[]>;
  createRecord: (
    expectedDeliveryDate: string,
    trimester?: number,
  ) => Promise<PregnancyRecord>;
  updateRecordEdd: (id: string, expectedDeliveryDate: string) => Promise<PregnancyRecord>;
  deleteRecord: (id: string) => Promise<void>;
};

export const usePregnancyStore = create<PregnancyState>((set, get) => ({
  records: [],
  fetchMyRecords: async () => {
    // Load cache immediately so the UI renders without waiting for the network
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      set({ records: JSON.parse(raw) });
    }
    try {
      const res = await api.get("/pregnancy/me");
      const list = res.data?.data ?? res.data ?? [];
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
      set({ records: Array.isArray(list) ? list : [] });
    } catch {
      // Cached data already applied above; nothing more to do
    }
  },
  createRecord: async (expectedDeliveryDate, trimester) => {
    const res = await api.post("/pregnancy", {
      expectedDeliveryDate,
      trimester,
    });
    const record = res.data?.data ?? res.data;
    set((s) => ({ records: [record, ...s.records] }));
    return record;
  },

  fetchRecordsForUser: async (userId: string) => {
    const res = await api.get(`/pregnancy/${userId}`);
    const list = res.data?.data ?? res.data ?? [];
    const typed = Array.isArray(list) ? (list as PregnancyRecord[]) : [];
    set({ records: typed });
    return typed;
  },

  updateRecordEdd: async (id, expectedDeliveryDate) => {
    const res = await api.put(`/pregnancy/${id}/edd`, { expectedDeliveryDate });
    const record = res.data?.data ?? res.data;
    set((s) => ({
      records: s.records.map((r) => (r.id === record.id ? record : r)),
    }));
    return record;
  },

  deleteRecord: async (id) => {
    await api.delete(`/pregnancy/${id}`);
    set((s) => ({
      records: s.records.filter((r) => r.id !== id),
    }));
  },
}));

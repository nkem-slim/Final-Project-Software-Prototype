import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export type Reminder = {
  id: string;
  userId: string;
  message: string;
  scheduledDate: string;
  status: string;
  channel: string;
  createdAt: string;
};

const CACHE_KEY = "@rimind/reminders";

type RemindersState = {
  reminders: Reminder[];
  loading: boolean;
  fetchMyReminders: () => Promise<void>;
  sendReminder: (input: { userId: string; message: string }) => Promise<void>;
  markAsDone: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
};

export const useRemindersStore = create<RemindersState>((set) => ({
  reminders: [],
  loading: false,
  fetchMyReminders: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/reminders/me");
      const list = res.data?.data ?? res.data ?? [];
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
      set({ reminders: Array.isArray(list) ? list : [] });
    } catch {
      const cached = await AsyncStorage.getItem(CACHE_KEY).then((s) =>
        s ? JSON.parse(s) : [],
      );
      set({ reminders: cached });
    } finally {
      set({ loading: false });
    }
  },
  sendReminder: async ({ userId, message }) => {
    const res = await api.post("/reminders/send", { userId, message });
    const created = res.data?.data ?? res.data;
    set((state) => ({ reminders: [created, ...state.reminders] }));
  },
  markAsDone: async (id) => {
    await api.patch(`/reminders/${id}/done`);
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, status: "SENT" } : r,
      ),
    }));
  },
  deleteReminder: async (id) => {
    await api.delete(`/reminders/${id}`);
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    }));
  },
}));

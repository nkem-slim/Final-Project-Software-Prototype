import { create } from "zustand";
import {
  clearCachedAuth,
  getCachedAuth,
  setCachedAuth,
} from "../utils/storage";
import api, { setAuthToken } from "../services/api";
import type { Role } from "../utils/constants";
import { useAiChatStore } from "./aiChatStore";

export type User = {
  id: string;
  name: string;
  phoneNumber: string;
  role: Role;
  country?: string | null;
  regionLevel1?: string | null;
  regionLevel2?: string | null;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (
    name: string,
    phoneNumber: string,
    password: string,
    role: Role,
    country: string,
    regionLevel1: string,
    regionLevel2: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateProfile: (input: { name: string; phoneNumber: string }) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isHydrated: false,

  login: async (phoneNumber, password) => {
    const res = await api.post<{
      data?: { user: User; accessToken: string; refreshToken: string };
      user?: User;
      accessToken?: string;
      refreshToken?: string;
    }>("/auth/login", {
      phoneNumber,
      password,
    });
    const data = res.data?.data ?? res.data;
    if (!data) throw new Error("Invalid response");
    setAuthToken(data.accessToken ?? "");
    await setCachedAuth({
      accessToken: data.accessToken ?? "",
      refreshToken: data.refreshToken ?? "",
      user: data.user,
    });
    set({ user: data.user, accessToken: data.accessToken ?? "" });
  },

  register: async (name, phoneNumber, password, role, country, regionLevel1, regionLevel2) => {
    const res = await api.post<{
      data?: { user: User; accessToken: string; refreshToken: string };
      user?: User;
      accessToken?: string;
      refreshToken?: string;
    }>("/auth/register", {
      name,
      phoneNumber,
      password,
      role,
      country,
      regionLevel1,
      regionLevel2,
    });
    const data = res.data?.data ?? res.data;
    if (!data) throw new Error("Invalid response");
    setAuthToken(data.accessToken ?? "");
    await setCachedAuth({
      accessToken: data.accessToken ?? "",
      refreshToken: data.refreshToken ?? "",
      user: data.user,
    });
    set({ user: data.user, accessToken: data.accessToken });
  },

  logout: async () => {
    setAuthToken(null);
    await clearCachedAuth();
    useAiChatStore.getState().clearHistory();
    set({ user: null, accessToken: null });
  },

  hydrate: async () => {
    const cached = await getCachedAuth();
    if (cached?.accessToken) {
      setAuthToken(cached.accessToken);
      set({
        user: cached.user as User,
        accessToken: cached.accessToken,
        isHydrated: true,
      });
    } else {
      set({ isHydrated: true });
    }
  },

  updateProfile: async ({ name, phoneNumber }) => {
    const res = await api.put<{ data?: User; id?: string; name?: string; phoneNumber?: string; role?: Role }>(
      "/auth/me",
      { name, phoneNumber },
    );
    const updated = (res.data?.data ?? res.data) as User;
    const state = get();
    const cached = await getCachedAuth();
    await setCachedAuth({
      accessToken: state.accessToken ?? cached?.accessToken ?? "",
      refreshToken: cached?.refreshToken ?? "",
      user: updated,
    });
    set({ user: updated });
  },
}));

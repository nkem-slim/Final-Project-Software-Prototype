import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants";

export const storage = {
  getItem: <T>(key: string): Promise<T | null> =>
    AsyncStorage.getItem(key).then((s) => (s ? (JSON.parse(s) as T) : null)),

  setItem: (key: string, value: unknown): Promise<void> =>
    AsyncStorage.setItem(key, JSON.stringify(value)),

  removeItem: (key: string): Promise<void> => AsyncStorage.removeItem(key),

  clear: (): Promise<void> => AsyncStorage.clear(),
};

export const getCachedAuth = () =>
  storage.getItem<{ accessToken: string; refreshToken: string; user: unknown }>(
    STORAGE_KEYS.AUTH_TOKEN,
  );
export const setCachedAuth = (data: {
  accessToken: string;
  refreshToken: string;
  user: unknown;
}) => storage.setItem(STORAGE_KEYS.AUTH_TOKEN, data);
export const clearCachedAuth = () =>
  storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

export const getOfflineQueue = () =>
  storage.getItem<OfflineQueueItem[]>(STORAGE_KEYS.OFFLINE_QUEUE);
export const setOfflineQueue = (items: OfflineQueueItem[]) =>
  storage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, items);

export type OfflineQueueItem = {
  id: string;
  method: string;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  createdAt: number;
};

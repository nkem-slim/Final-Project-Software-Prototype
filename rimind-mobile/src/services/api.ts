import axios, { AxiosError, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../utils/constants";
import {
  getOfflineQueue,
  setOfflineQueue,
  type OfflineQueueItem,
} from "../utils/storage";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const QUEUE_KEY = "@rimind/offlineQueue";

const addToQueue = async (config: AxiosRequestConfig): Promise<void> => {
  const queue = (await AsyncStorage.getItem(QUEUE_KEY).then((s) =>
    s ? JSON.parse(s) : [],
  )) as OfflineQueueItem[];
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    method: config.method ?? "GET",
    url: config.url ?? "",
    body: config.data,
    headers: config.headers as Record<string, string>,
    createdAt: Date.now(),
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

api.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.message?.includes("Network") || error.code === "ECONNABORTED") {
      if (!config._retry) {
        await addToQueue(config);
      }
    }
    return Promise.reject(error);
  },
);

export const flushOfflineQueue = async (): Promise<void> => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const queue: OfflineQueueItem[] = raw ? JSON.parse(raw) : [];
  if (queue.length === 0) return;
  const processed: OfflineQueueItem[] = [];
  for (const item of queue) {
    try {
      await api.request({
        method: item.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        url: item.url,
        data: item.body,
        headers: item.headers,
      });
    } catch {
      processed.push(item);
    }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(processed));
};

export default api;

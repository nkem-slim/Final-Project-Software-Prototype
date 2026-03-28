import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
const QUEUE_KEY = "@rimind/offlineQueue";

export const useOfflineQueue = (): {
  queueLength: number;
  refresh: () => Promise<void>;
} => {
  const [queueLength, setQueueLength] = useState(0);

  const refresh = useCallback(async () => {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    setQueueLength(Array.isArray(queue) ? queue.length : 0);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { queueLength, refresh };
};

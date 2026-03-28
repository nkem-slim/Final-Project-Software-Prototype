/**
 * Sync Zustand store — record sync event on device.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const DEVICE_ID_KEY = '@rimind/deviceId';

const getOrCreateDeviceId = async (): Promise<string> => {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

type SyncState = {
  recordSync: (recordCount: number, status: 'SUCCESS' | 'PARTIAL' | 'FAILED') => Promise<void>;
};

export const useSyncStore = create<SyncState>(() => ({
  recordSync: async (recordCount, status) => {
    const deviceId = await getOrCreateDeviceId();
    await api.post('/sync', { deviceId, recordCount, status });
  },
}));

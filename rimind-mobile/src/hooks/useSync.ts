import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { flushOfflineQueue } from "../services/api";

export const useSync = (onSyncDone?: () => void): void => {
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;
      if (wasOffline.current && isOnline) {
        flushOfflineQueue().then(() => onSyncDone?.());
      }
      wasOffline.current = !isOnline;
    });
    return () => unsubscribe();
  }, [onSyncDone]);
};

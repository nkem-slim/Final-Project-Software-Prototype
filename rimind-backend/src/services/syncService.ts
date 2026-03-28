import { syncLogRepository } from "../repositories/syncLogRepository";

export type SyncInput = {
  userId: string;
  deviceId: string;
  recordCount: number;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
};

export const syncService = {
  recordSync: (input: SyncInput) =>
    syncLogRepository.create({
      userId: input.userId,
      deviceId: input.deviceId,
      recordCount: input.recordCount,
      status: input.status,
    }),

  getStatusByDevice: (deviceId: string) =>
    syncLogRepository.findByDeviceId(deviceId),
};

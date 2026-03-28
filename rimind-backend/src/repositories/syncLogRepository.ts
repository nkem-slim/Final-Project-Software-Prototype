import { prisma } from "../config/database";

export const syncLogRepository = {
  create: (data: {
    userId: string;
    deviceId: string;
    recordCount: number;
    status: string;
  }) => prisma.syncLog.create({ data }),

  findByDeviceId: (deviceId: string) =>
    prisma.syncLog.findMany({
      where: { deviceId },
      orderBy: { syncedAt: "desc" },
      take: 20,
    }),

  findRecent: (limit: number) =>
    prisma.syncLog.findMany({
      orderBy: { syncedAt: "desc" },
      take: limit,
    }),
};

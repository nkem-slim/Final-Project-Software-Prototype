import { userRepository } from "../repositories/userRepository";
import { reminderRepository } from "../repositories/reminderRepository";
import { syncLogRepository } from "../repositories/syncLogRepository";
import { AppError } from "../middleware/errorHandler";
import type { Role } from "@prisma/client";

export type SystemReport = {
  usersByRole: Record<Role, number>;
  reminderCounts: { PENDING: number; SENT: number; FAILED: number };
  recentSyncLogs: Array<{
    id: string;
    userId: string;
    deviceId: string;
    syncedAt: Date;
    recordCount: number;
    status: string;
  }>;
};

export const adminService = {
  getUsers: () => userRepository.findAll(),

  getReports: async (): Promise<SystemReport> => {
    const [users, reminderGroups, syncLogsAll] = await Promise.all([
      userRepository.findAll(),
      reminderRepository.countByStatus(),
      syncLogRepository.findRecent(50),
    ]);
    const usersByRole = users.reduce(
      (acc, u) => {
        acc[u.role] = (acc[u.role] ?? 0) + 1;
        return acc;
      },
      {} as Record<Role, number>,
    );
    const reminderCounts = { PENDING: 0, SENT: 0, FAILED: 0 };
    for (const g of reminderGroups) {
      reminderCounts[g.status] = g._count.id;
    }
    return {
      usersByRole: {
        MOTHER: usersByRole.MOTHER ?? 0,
        HEALTH_WORKER: usersByRole.HEALTH_WORKER ?? 0,
        ADMIN: usersByRole.ADMIN ?? 0,
      },
      reminderCounts,
      recentSyncLogs: syncLogsAll.map((s) => ({
        id: s.id,
        userId: s.userId,
        deviceId: s.deviceId,
        syncedAt: s.syncedAt,
        recordCount: s.recordCount,
        status: s.status,
      })),
    };
  },

  deleteUser: async (userId: string, requesterId: string): Promise<void> => {
    if (userId === requesterId) {
      throw new AppError(
        "Cannot delete your own account",
        400,
        "VALIDATION_ERROR",
      );
    }
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    await userRepository.deleteById(userId);
  },
};

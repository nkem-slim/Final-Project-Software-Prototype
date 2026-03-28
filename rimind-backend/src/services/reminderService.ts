/**
 * Reminder service — generate by trimester, get for user, update status.
 * FR3: Trimester-based schedule; predefined templates only.
 */

import { reminderRepository } from "../repositories/reminderRepository";
import { pregnancyRecordRepository } from "../repositories/pregnancyRecordRepository";
import { userRepository } from "../repositories/userRepository";
import { addWeeks } from "../utils/dateUtils";
import { getTemplate } from "../utils/smsTemplates";
import { AppError } from "../middleware/errorHandler";
import type { ReminderStatus, Role } from "@prisma/client";

/** Admin broadcast targets (MOTHER + HEALTH_WORKER only). */
const NOTIFICATION_RECIPIENT_ROLES: readonly Role[] = ["MOTHER", "HEALTH_WORKER"];

type ReminderRow = {
  userId: string;
  message: string;
  scheduledDate: Date;
  status: "PENDING";
  channel: string;
};

const buildScheduleByTrimester = (
  userId: string,
  startDate: Date,
  expectedDeliveryDate: Date,
  trimester: number
): ReminderRow[] => {
  const base = { userId, status: "PENDING" as const, channel: "PUSH" };
  const rows: ReminderRow[] = [];

  if (trimester === 1) {
    for (let w = 0; w < 12; w++) {
      rows.push({
        ...base,
        message: getTemplate("WEEKLY_CHECKIN"),
        scheduledDate: addWeeks(startDate, w),
      });
    }
    // Immunisation schedule placeholder (postnatal)
    for (const weeks of [6, 10, 14]) {
      rows.push({
        ...base,
        message: getTemplate("IMMUNISATION_ALERT"),
        scheduledDate: addWeeks(expectedDeliveryDate, weeks),
      });
    }
  } else if (trimester === 2) {
    for (let w = 0; w <= 14; w += 2) {
      rows.push({
        ...base,
        message: getTemplate("APPOINTMENT_REMINDER"),
        scheduledDate: addWeeks(startDate, w),
      });
      rows.push({
        ...base,
        message: getTemplate("NUTRITION_TIP"),
        scheduledDate: addWeeks(startDate, w),
      });
    }
    for (const weeks of [6, 10, 14]) {
      rows.push({
        ...base,
        message: getTemplate("IMMUNISATION_ALERT"),
        scheduledDate: addWeeks(expectedDeliveryDate, weeks),
      });
    }
  } else {
    // Trimester 3
    for (let w = 0; w < 14; w++) {
      rows.push({
        ...base,
        message: getTemplate("WEEKLY_CHECKIN"),
        scheduledDate: addWeeks(startDate, w),
      });
    }
    rows.push({
      ...base,
      message: getTemplate("BIRTH_PREPAREDNESS"),
      scheduledDate: addWeeks(expectedDeliveryDate, -2),
    });
    rows.push({
      ...base,
      message: getTemplate("BIRTH_PREPAREDNESS"),
      scheduledDate: addWeeks(expectedDeliveryDate, -1),
    });
    for (const weeks of [6, 10, 14]) {
      rows.push({
        ...base,
        message: getTemplate("IMMUNISATION_ALERT"),
        scheduledDate: addWeeks(expectedDeliveryDate, weeks),
      });
    }
  }

  return rows;
};

export const reminderService = {
  /**
   * Generate reminders for a pregnancy record (on create or via ADMIN).
   * SRS: T1 weekly + immunisation; T2 bi-weekly + nutrition; T3 weekly + birth preparedness; postnatal immunisation.
   */
  generateForPregnancyRecord: async (params: {
    userId: string;
    expectedDeliveryDate: Date;
    trimester: number;
    createdAt?: Date;
  }) => {
    const startDate = params.createdAt ?? new Date();
    const edd = params.expectedDeliveryDate instanceof Date ? params.expectedDeliveryDate : new Date(params.expectedDeliveryDate);
    const schedule = buildScheduleByTrimester(
      params.userId,
      startDate,
      edd,
      params.trimester
    );
    await reminderRepository.createMany(schedule);
    return { count: schedule.length };
  },

  getForUser: (userId: string) => reminderRepository.findByUserId(userId),

  sendByAdmin: async (params: {
    userId: string;
    message: string;
    scheduledDate?: Date;
  }) => {
    const targetUser = await userRepository.findById(params.userId);
    if (!targetUser) {
      throw new AppError("Target user not found", 404, "NOT_FOUND");
    }
    if (!NOTIFICATION_RECIPIENT_ROLES.includes(targetUser.role)) {
      throw new AppError(
        "You can only send notifications to Mother or CHW accounts (not Admin).",
        400,
        "VALIDATION_ERROR",
      );
    }
    return reminderRepository.create({
      userId: params.userId,
      message: params.message,
      scheduledDate: params.scheduledDate ?? new Date(),
      status: "PENDING",
      channel: "PUSH",
    });
  },

  updateStatus: async (id: string, status: ReminderStatus) => {
    const reminder = await reminderRepository.findById(id);
    if (!reminder) throw new AppError("Reminder not found", 404, "NOT_FOUND");
    return reminderRepository.updateStatus(id, status);
  },

  markAsDone: async (id: string, requester: { userId: string; role: Role }) => {
    const reminder = await reminderRepository.findById(id);
    if (!reminder) throw new AppError("Reminder not found", 404, "NOT_FOUND");
    const canUpdate =
      requester.role === "ADMIN" || reminder.userId === requester.userId;
    if (!canUpdate) {
      throw new AppError("Insufficient permissions", 403, "FORBIDDEN");
    }
    return reminderRepository.updateStatus(id, "SENT");
  },

  delete: async (id: string, requester: { userId: string; role: Role }) => {
    const reminder = await reminderRepository.findById(id);
    if (!reminder) throw new AppError("Reminder not found", 404, "NOT_FOUND");
    const canDelete =
      requester.role === "ADMIN" || reminder.userId === requester.userId;
    if (!canDelete) {
      throw new AppError("Insufficient permissions", 403, "FORBIDDEN");
    }
    await reminderRepository.deleteById(id);
    return { deleted: true };
  },
};

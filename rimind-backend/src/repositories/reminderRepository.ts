import { prisma } from "../config/database";
import type { ReminderStatus } from "@prisma/client";

export type CreateReminderInput = {
  userId: string;
  message: string;
  scheduledDate: Date;
  status?: ReminderStatus;
  channel?: string;
};

export const reminderRepository = {
  create: (data: CreateReminderInput) => prisma.reminder.create({ data }),

  createMany: (data: CreateReminderInput[]) =>
    prisma.reminder.createMany({ data }),

  findByUserId: (userId: string) =>
    prisma.reminder.findMany({
      where: { userId },
      orderBy: { scheduledDate: "asc" },
    }),

  findById: (id: string) =>
    prisma.reminder.findUnique({
      where: { id },
      include: { user: { select: { id: true, phoneNumber: true } } },
    }),

  updateStatus: (id: string, status: ReminderStatus) =>
    prisma.reminder.update({
      where: { id },
      data: { status },
    }),

  deleteById: (id: string) =>
    prisma.reminder.delete({
      where: { id },
    }),

  countByStatus: () =>
    prisma.reminder.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
};

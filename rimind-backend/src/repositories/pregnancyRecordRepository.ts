/**
 * Pregnancy record repository — Prisma data access for PregnancyRecord.
 */

import { prisma } from "../config/database";

export type CreatePregnancyRecordInput = {
  userId: string;
  expectedDeliveryDate: Date;
  trimester: number;
  healthNotes?: string | null;
};

export const pregnancyRecordRepository = {
  create: (data: CreatePregnancyRecordInput) => prisma.pregnancyRecord.create({ data }),

  findById: (id: string) =>
    prisma.pregnancyRecord.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, phoneNumber: true } } },
    }),

  findByUserId: (userId: string) =>
    prisma.pregnancyRecord.findMany({
      where: { userId },
      orderBy: { expectedDeliveryDate: "desc" },
    }),

  updateHealthNotes: (id: string, healthNotes: string | null, lastUpdatedBy: string) =>
    prisma.pregnancyRecord.update({
      where: { id },
      data: { healthNotes, lastUpdatedBy },
    }),

  updateEddAndTrimester: (id: string, expectedDeliveryDate: Date, trimester: number) =>
    prisma.pregnancyRecord.update({
      where: { id },
      data: { expectedDeliveryDate, trimester },
    }),

  deleteById: (id: string) =>
    prisma.pregnancyRecord.delete({
      where: { id },
    }),
};

import { pregnancyRecordRepository } from "../repositories/pregnancyRecordRepository";
import { userRepository } from "../repositories/userRepository";
import { reminderService } from "./reminderService";
import { getTrimesterFromEDD } from "../utils/dateUtils";
import { AppError } from "../middleware/errorHandler";
import type { Role } from "@prisma/client";

export type CreatePregnancyInput = {
  userId: string;
  expectedDeliveryDate: Date;
  trimester?: number;
};

export type UpdateHealthNotesInput = {
  pregnancyRecordId: string;
  healthNotes: string | null;
  updatedByUserId: string;
  updatedByRole: Role;
};

export type UpdateEddInput = {
  pregnancyRecordId: string;
  expectedDeliveryDate: Date;
  updatedByUserId: string;
  updatedByRole: Role;
};

export type DeletePregnancyInput = {
  pregnancyRecordId: string;
  requestedByUserId: string;
  requestedByRole: Role;
};

export const pregnancyService = {
  create: async (input: CreatePregnancyInput) => {
    const edd =
      input.expectedDeliveryDate instanceof Date
        ? input.expectedDeliveryDate
        : new Date(input.expectedDeliveryDate);
    const trimester = input.trimester ?? getTrimesterFromEDD(edd);
    if (trimester < 1 || trimester > 3) {
      throw new AppError(
        "Trimester must be 1, 2, or 3",
        400,
        "VALIDATION_ERROR",
      );
    }
    const record = await pregnancyRecordRepository.create({
      userId: input.userId,
      expectedDeliveryDate: edd,
      trimester,
    });
    await reminderService.generateForPregnancyRecord({
      userId: input.userId,
      expectedDeliveryDate: edd,
      trimester,
      createdAt: record.createdAt,
    });
    return record;
  },

  getMyRecords: (userId: string) =>
    pregnancyRecordRepository.findByUserId(userId),

  getByUserId: async (userId: string, _requesterRole: Role) => {
    return pregnancyRecordRepository.findByUserId(userId);
  },

  updateHealthNotes: async (input: UpdateHealthNotesInput) => {
    if (
      input.updatedByRole !== "HEALTH_WORKER" &&
      input.updatedByRole !== "ADMIN"
    ) {
      throw new AppError(
        "Only a health worker can update health notes",
        403,
        "FORBIDDEN",
      );
    }
    const record = await pregnancyRecordRepository.findById(
      input.pregnancyRecordId,
    );
    if (!record)
      throw new AppError("Pregnancy record not found", 404, "NOT_FOUND");
    return pregnancyRecordRepository.updateHealthNotes(
      input.pregnancyRecordId,
      input.healthNotes,
      input.updatedByUserId,
    );
  },

  updateEdd: async (input: UpdateEddInput) => {
    const record = await pregnancyRecordRepository.findById(
      input.pregnancyRecordId,
    );
    if (!record)
      throw new AppError("Pregnancy record not found", 404, "NOT_FOUND");

    const isOwner = record.userId === input.updatedByUserId;
    const isHealthWorker = input.updatedByRole === "HEALTH_WORKER";
    const isAdmin = input.updatedByRole === "ADMIN";

    if (!isOwner && !isHealthWorker && !isAdmin) {
      throw new AppError(
        "Not allowed to update this pregnancy record",
        403,
        "FORBIDDEN",
      );
    }

    const edd =
      input.expectedDeliveryDate instanceof Date
        ? input.expectedDeliveryDate
        : new Date(input.expectedDeliveryDate);
    const trimester = getTrimesterFromEDD(edd);
    if (trimester < 1 || trimester > 3) {
      throw new AppError(
        "Trimester must be 1, 2, or 3",
        400,
        "VALIDATION_ERROR",
      );
    }

    return pregnancyRecordRepository.updateEddAndTrimester(
      input.pregnancyRecordId,
      edd,
      trimester,
    );
  },

  delete: async (input: DeletePregnancyInput) => {
    const record = await pregnancyRecordRepository.findById(
      input.pregnancyRecordId,
    );
    if (!record)
      throw new AppError("Pregnancy record not found", 404, "NOT_FOUND");

    const isOwner = record.userId === input.requestedByUserId;
    const isAdmin = input.requestedByRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new AppError(
        "Not allowed to delete this pregnancy record",
        403,
        "FORBIDDEN",
      );
    }

    await pregnancyRecordRepository.deleteById(input.pregnancyRecordId);
  },
};

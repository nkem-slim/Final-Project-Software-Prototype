/**
 * SMS service — dispatch reminder via predefined templates.
 * FR3: No sensitive health data in SMS. Africa's Talking when configured.
 */

import { reminderRepository } from "../repositories/reminderRepository";
import { sendSms, isAfricasTalkingConfigured } from "../config/africastalking";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/errorHandler";

/**
 * Send a reminder by ID as SMS (template message only).
 * Internal use — e.g. cron or POST /api/sms/send.
 */
export const smsService = {
  sendReminder: async (reminderId: string): Promise<{ sent: boolean }> => {
    const reminder = await reminderRepository.findById(reminderId);
    if (!reminder) throw new AppError("Reminder not found", 404, "NOT_FOUND");
    if (reminder.status !== "PENDING") {
      logger.info("SMS skip: reminder already processed", { reminderId, status: reminder.status });
      return { sent: false };
    }

    const phoneNumber = reminder.user?.phoneNumber;
    if (!phoneNumber) {
      logger.warn("SMS skip: no phone number for reminder", { reminderId });
      await reminderRepository.updateStatus(reminderId, "FAILED");
      return { sent: false };
    }

    if (isAfricasTalkingConfigured()) {
      const { success } = await sendSms(phoneNumber, reminder.message);
      await reminderRepository.updateStatus(reminderId, success ? "SENT" : "FAILED");
      return { sent: success };
    }

    logger.info("SMS dispatch (stub: Africa's Talking not configured)", {
      reminderId,
      phoneNumber,
      messageLength: reminder.message.length,
    });
    await reminderRepository.updateStatus(reminderId, "SENT");
    return { sent: true };
  },
};

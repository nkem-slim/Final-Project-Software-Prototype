/**
 * Africa's Talking API client — SMS send.
 * SRS: SMS gateway Africa's Talking (or equivalent); predefined templates only.
 */

import { env } from "./env";
import { logger } from "../utils/logger";

const BASE_URL = env.AFRICAS_TALKING_BASE_URL || "https://api.sandbox.africastalking.com";

export const isAfricasTalkingConfigured = (): boolean =>
  Boolean(env.AFRICAS_TALKING_API_KEY && env.AFRICAS_TALKING_USERNAME);

/**
 * Send a single SMS via Africa's Talking.
 * @param to - E.164 phone number (e.g. +250788123456)
 * @param message - Predefined template message only (no sensitive health data)
 */
export const sendSms = async (to: string, message: string): Promise<{ success: boolean; messageId?: string }> => {
  if (!isAfricasTalkingConfigured()) {
    logger.warn("Africa's Talking not configured; SMS not sent", { to, messageLength: message.length });
    return { success: false };
  }

  const body = new URLSearchParams({
    username: env.AFRICAS_TALKING_USERNAME,
    to: to.replace(/\s/g, ""),
    message,
    ...(env.SMS_SENDER_ID && { from: env.SMS_SENDER_ID }),
  });

  const res = await fetch(`${BASE_URL}/version1/messaging`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ApiKey: env.AFRICAS_TALKING_API_KEY,
    },
    body: body.toString(),
  });

  const data = (await res.json()) as {
    SMSMessageData?: { Recipients?: Array<{ status: string; messageId?: string }> };
  };

  if (!res.ok) {
    logger.error("Africa's Talking SMS failed", { status: res.status, body: data });
    return { success: false };
  }

  const recipient = data.SMSMessageData?.Recipients?.[0];
  const success = recipient?.status === "Success";
  if (!success) {
    logger.warn("Africa's Talking SMS rejected or failed", { data });
  }
  return { success, messageId: recipient?.messageId };
};

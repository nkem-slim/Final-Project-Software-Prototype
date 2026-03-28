/**
 * Predefined SMS templates — no sensitive personal health data (SRS §3.1.4, FR3).
 */

export const SMS_TEMPLATES = {
  APPOINTMENT_REMINDER: "Rimind: Your antenatal appointment is coming up. Please visit your clinic as scheduled.",
  IMMUNISATION_ALERT: "Rimind: Immunisation reminder. Please take your child for scheduled vaccinations.",
  HEALTH_TIP: "Rimind: A small health tip for you today. Stay hydrated and rest when needed.",
  EXERCISE_REMINDER: "Rimind: Time for your gentle exercise. Follow the safe routines in the app.",
  WEEKLY_CHECKIN: "Rimind: Weekly check-in. How are you feeling? Log any concerns in the app.",
  BIRTH_PREPAREDNESS: "Rimind: Birth preparedness reminder. Pack your bag and know your clinic contacts.",
  NUTRITION_TIP: "Rimind: Nutrition tip: eat a variety of foods. Ask your clinic for dietary advice.",
} as const;

export type SmsTemplateKey = keyof typeof SMS_TEMPLATES;

export const getTemplate = (key: SmsTemplateKey): string => SMS_TEMPLATES[key];

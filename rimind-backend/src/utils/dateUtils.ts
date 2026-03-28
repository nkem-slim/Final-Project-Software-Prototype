/**
 * Date helpers — trimester from EDD, add weeks for reminder scheduling.
 */

/**
 * Weeks from a given date until expected delivery date (EDD).
 * Used to derive trimester when not supplied.
 */
export const weeksUntil = (from: Date, edd: Date): number => {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((edd.getTime() - from.getTime()) / msPerWeek);
};

/**
 * Derive trimester (1, 2, or 3) from expected delivery date.
 * Trimester 1: >27 weeks to EDD; 2: 14–27 weeks; 3: 0–13 weeks.
 */
export const getTrimesterFromEDD = (expectedDeliveryDate: Date, from: Date = new Date()): number => {
  const weeks = weeksUntil(from, expectedDeliveryDate);
  if (weeks > 27) return 1;
  if (weeks > 13) return 2;
  return 3;
};

/**
 * Add weeks to a date (for scheduling reminders).
 */
export const addWeeks = (date: Date, weeks: number): Date => {
  const out = new Date(date);
  out.setDate(out.getDate() + weeks * 7);
  return out;
};

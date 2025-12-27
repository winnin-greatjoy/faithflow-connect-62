import { addDays, isSaturday, isSunday } from 'date-fns';

export type ObservedRule = 'SUNDAY_TO_MONDAY' | 'SAT_SUN_TO_MONDAY' | 'NONE';

/**
 * Applies observed holiday rules (e.g., Sunday -> Monday)
 */
export function applyObservedRule(
  date: Date,
  rule: ObservedRule
): { date: Date; observed: boolean } {
  if (rule === 'NONE') return { date, observed: false };

  if (rule === 'SUNDAY_TO_MONDAY' && isSunday(date)) {
    return { date: addDays(date, 1), observed: true };
  }

  if (rule === 'SAT_SUN_TO_MONDAY') {
    if (isSaturday(date)) {
      return { date: addDays(date, 2), observed: true };
    }
    if (isSunday(date)) {
      return { date: addDays(date, 1), observed: true };
    }
  }

  return { date, observed: false };
}

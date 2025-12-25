import { addDays, subDays } from 'date-fns';
import { applyObservedRule, ObservedRule } from './observedRules';

export type CountryObservedPolicy = {
  defaultRule: ObservedRule;
  exceptions?: Record<string, ObservedRule | null>;
};

export const SIERRA_LEONE_POLICY: CountryObservedPolicy = {
  defaultRule: 'SUNDAY_TO_MONDAY',
  exceptions: {
    'Christmas Day': 'SAT_SUN_TO_MONDAY',
  },
};

export type HolidayMetadata = {
  title: string;
  date: Date;
  isObserved: boolean;
  originalDate?: Date;
};

/**
 * FIXED HOLIDAYS (Sierra Leone)
 * Rules: Month is 0-indexed (0 = Jan, 11 = Dec)
 * observed: true means if it falls on Sunday, it shifts to Monday
 */
export const FIXED_HOLIDAY_RULES = [
  { month: 0, day: 1, title: "New Year's Day", observed: true },
  { month: 1, day: 14, title: "Valentine's Day", observed: false },
  { month: 1, day: 18, title: 'Armed Forces Day', observed: true },
  { month: 2, day: 8, title: "International Women's Day", observed: false },
  { month: 3, day: 22, title: 'Earth Day', observed: false },
  { month: 3, day: 27, title: 'Independence Day', observed: true },
  { month: 4, day: 1, title: "Workers' Day", observed: true },
  { month: 4, day: 25, title: 'Africa Day', observed: false },
  { month: 5, day: 16, title: 'Day of the African Child', observed: false },
  { month: 8, day: 21, title: "Int'l Day of Peace", observed: false },
  { month: 9, day: 24, title: 'United Nations Day', observed: false },
  { month: 11, day: 1, title: 'World AIDS Day', observed: false },
  { month: 11, day: 25, title: 'Christmas Day', observed: true },
  { month: 11, day: 26, title: 'Boxing Day', observed: true },
];

/**
 * Calculates Easter Sunday for any given year
 */
export function calculateEaster(year: number): Date {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Derives movable Christian holidays based on Easter
 */
export function getChristianHolidays(year: number): HolidayMetadata[] {
  const easter = calculateEaster(year);
  return [
    { title: 'Good Friday', date: subDays(easter, 2), isObserved: false },
    { title: 'Easter Monday', date: addDays(easter, 1), isObserved: false },
  ];
}

/**
 * Combines fixed and Christian holidays for a specific year
 * Supports country policies for observed holidays
 */
export function getRuleBasedHolidays(
  year: number,
  options?: { hideOriginalWhenObserved?: boolean },
  policy: CountryObservedPolicy = SIERRA_LEONE_POLICY
): HolidayMetadata[] {
  const holidays: HolidayMetadata[] = [];

  FIXED_HOLIDAY_RULES.forEach((h) => {
    const baseDate = new Date(Date.UTC(year, h.month, h.day));

    if (h.observed) {
      const rule = policy.exceptions?.[h.title] ?? policy.defaultRule;
      const observedResult = applyObservedRule(baseDate, rule);

      if (observedResult.observed) {
        if (!options?.hideOriginalWhenObserved) {
          holidays.push({ title: h.title, date: baseDate, isObserved: false });
        }
        holidays.push({
          title: `${h.title} (Observed)`,
          date: observedResult.date,
          isObserved: true,
          originalDate: baseDate,
        });
        return;
      }
    }

    holidays.push({ title: h.title, date: baseDate, isObserved: false });
  });

  const christian = getChristianHolidays(year);
  holidays.push(...christian);

  return holidays;
}

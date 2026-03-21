import { ApiError } from '@repo/shared';

/**
 * Parses a YYYY-MM-DD date string to a Date at UTC midnight.
 */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Parses YYYY-MM or YYYY-MM-DD to a Date at 1st of the month (UTC midnight).
 */
export function parseMonthYearToFirstDay(value: string): Date {
  const parts = value.trim().split('-');
  const year = parseInt(parts[0] ?? '0', 10);
  const month = parseInt(parts[1] ?? '1', 10);
  return new Date(Date.UTC(year, month - 1, 1));
}

/** Ensures effectiveFrom <= effectiveTill when both are set. */
export function validateEffectiveFromBeforeTill(from: Date, till: Date | null): void {
  if (!till) return;
  const fromNorm = new Date(from);
  fromNorm.setUTCHours(0, 0, 0, 0);
  const tillNorm = new Date(till);
  tillNorm.setUTCHours(0, 0, 0, 0);
  if (fromNorm > tillNorm) {
    throw new ApiError('Effective from must be on or before effective till', 400);
  }
}

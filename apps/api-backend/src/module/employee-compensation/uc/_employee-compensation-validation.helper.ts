import { ApiError } from '@repo/shared';

/**
 * Parses a YYYY-MM-DD date string to a Date at UTC midnight.
 * Avoids timezone shift (e.g. "2026-01-01" staying as 2026-01-01, not 2025-12-31).
 */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

type CompensationWithDates = {
  id: number;
  effectiveFrom: Date;
  effectiveTill: Date | null;
};

/**
 * Validates that newEffectiveFrom is not between effectiveFrom and effectiveTill of any compensation in compsToCheck.
 * @throws ApiError if overlap is detected
 */
export function validateEffectiveFromNoOverlap(
  newEffectiveFrom: Date,
  compsToCheck: CompensationWithDates[],
): void {
  const normalized = new Date(newEffectiveFrom);
  normalized.setUTCHours(0, 0, 0, 0);

  for (const comp of compsToCheck) {
    const compFrom = new Date(comp.effectiveFrom);
    compFrom.setUTCHours(0, 0, 0, 0);
    const compTill = comp.effectiveTill ? new Date(comp.effectiveTill) : null;
    if (compTill) compTill.setUTCHours(23, 59, 59, 999);

    const isBetween = compTill
      ? normalized >= compFrom && normalized <= compTill
      : normalized >= compFrom;

    if (isBetween) {
      throw new ApiError(
        `Effective from cannot be between ${comp.effectiveFrom.toISOString().split('T')[0]} and ${comp.effectiveTill ? comp.effectiveTill.toISOString().split('T')[0] : 'present'} of an existing compensation`,
        400,
      );
    }
  }
}

/**
 * Validates that the date range [newFrom, newTill] does not overlap with any compensation in compsToCheck.
 * null effectiveTill means "ongoing" (range extends indefinitely).
 * @throws ApiError if overlap is detected
 */
export function validateEffectiveRangeNoOverlap(
  newFrom: Date,
  newTill: Date | null,
  compsToCheck: CompensationWithDates[],
): void {
  const from = new Date(newFrom);
  from.setUTCHours(0, 0, 0, 0);
  const till = newTill ? (() => {
    const d = new Date(newTill);
    d.setUTCHours(23, 59, 59, 999);
    return d;
  })() : null;

  for (const comp of compsToCheck) {
    const compFrom = new Date(comp.effectiveFrom);
    compFrom.setUTCHours(0, 0, 0, 0);
    const compTill = comp.effectiveTill ? (() => {
      const d = new Date(comp.effectiveTill!);
      d.setUTCHours(23, 59, 59, 999);
      return d;
    })() : null;

    // Ranges [from, till] and [compFrom, compTill] overlap iff from <= compTill && compFrom <= till
    // When till/compTill is null, treat as "no end" - use far future for comparison
    const newEnd = till ?? new Date(864000000000000); // max safe date
    const compEnd = compTill ?? new Date(864000000000000);

    if (from <= compEnd && compFrom <= newEnd) {
      throw new ApiError(
        `Effective dates overlap with existing compensation (${comp.effectiveFrom.toISOString().split('T')[0]} to ${comp.effectiveTill ? comp.effectiveTill.toISOString().split('T')[0] : 'present'})`,
        400,
      );
    }
  }
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


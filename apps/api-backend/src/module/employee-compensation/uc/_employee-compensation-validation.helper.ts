import { ApiError } from '@repo/shared';

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
  normalized.setHours(0, 0, 0, 0);

  for (const comp of compsToCheck) {
    const compFrom = new Date(comp.effectiveFrom);
    compFrom.setHours(0, 0, 0, 0);
    const compTill = comp.effectiveTill ? new Date(comp.effectiveTill) : null;
    if (compTill) compTill.setHours(23, 59, 59, 999);

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


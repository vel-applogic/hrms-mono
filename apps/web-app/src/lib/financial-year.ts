import 'server-only';

import { DEFAULT_FINANCIAL_YEAR_START_MONTH } from '@repo/shared';

import { organisationService } from '@/lib/service/organisation.service';

/**
 * Resolves the current organisation's financial-year start month (1-12).
 * Falls back to the default (April) when no setting is configured or the
 * request fails, so callers always get a usable value.
 */
export async function getCurrentOrgFinancialYearStartMonth(): Promise<number> {
  try {
    const setting = await organisationService.getMySetting();
    return setting?.financialYearStartsAt ?? DEFAULT_FINANCIAL_YEAR_START_MONTH;
  } catch {
    return DEFAULT_FINANCIAL_YEAR_START_MONTH;
  }
}

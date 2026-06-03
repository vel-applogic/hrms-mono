/**
 * Financial year helpers.
 *
 * The financial year start month is configurable per organisation
 * (`OrganisationSetting.financialYearStartsAt`, 1 = January … 12 = December).
 * When not supplied, it defaults to April (4).
 *
 * Code format:
 * - Start month other than January spans two calendar years, e.g. a year
 *   starting April 2026 (ending March 2027) is `FY2627`.
 * - Start month January spans a single calendar year, e.g. `FY2026`.
 */

export const DEFAULT_FINANCIAL_YEAR_START_MONTH = 4;

function normaliseStartMonth(startMonth?: number): number {
  if (!startMonth || startMonth < 1 || startMonth > 12) {
    return DEFAULT_FINANCIAL_YEAR_START_MONTH;
  }
  return Math.floor(startMonth);
}

/**
 * Calendar year in which the financial year containing `date` begins.
 */
function getFinancialYearStartYear(date: Date, startMonth: number): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-indexed: Jan=1, Apr=4
  return month >= startMonth ? year : year - 1;
}

function buildFinancialYearCode(startYear: number, startMonth: number): string {
  if (startMonth === 1) {
    // Single calendar year, e.g. FY2026
    return `FY${startYear}`;
  }
  // Two calendar years, e.g. FY2627 for Apr 2026 - Mar 2027
  return `FY${String(startYear).slice(-2)}${String(startYear + 1).slice(-2)}`;
}

/**
 * Financial year code for a date.
 * e.g. startMonth 4 + June 2026 -> 'FY2627'; startMonth 1 + June 2026 -> 'FY2026'.
 */
export function getFinancialYearCode(date: Date, startMonth?: number): string {
  const month = normaliseStartMonth(startMonth);
  const startYear = getFinancialYearStartYear(new Date(date), month);
  return buildFinancialYearCode(startYear, month);
}

/**
 * Last N financial year codes including current, newest first.
 * e.g. getLastFinancialYearCodes(3, 4) -> ['FY2627', 'FY2526', 'FY2425'] when current is FY2627.
 */
export function getLastFinancialYearCodes(count: number, startMonth?: number): string[] {
  const month = normaliseStartMonth(startMonth);
  let startYear = getFinancialYearStartYear(new Date(), month);
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(buildFinancialYearCode(startYear, month));
    startYear -= 1;
  }
  return codes;
}

function getFinancialYearStartYearFromCode(financialYear: string, startMonth: number): number {
  if (startMonth === 1) {
    const match = financialYear.match(/^FY(\d{4})$/);
    if (!match) {
      throw new Error(`Invalid financial year code: ${financialYear}`);
    }
    return parseInt(match[1]!, 10);
  }
  const match = financialYear.match(/^FY(\d{2})(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid financial year code: ${financialYear}`);
  }
  return 2000 + parseInt(match[1]!, 10);
}

/**
 * Date range for a financial year code.
 * e.g. 'FY2627' with startMonth 4 -> April 1, 2026 to March 31, 2027.
 */
export function getFinancialYearDateRange(financialYear: string, startMonth?: number): { start: Date; end: Date } {
  const month = normaliseStartMonth(startMonth);
  const startYear = getFinancialYearStartYearFromCode(financialYear, month);
  const start = new Date(startYear, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(startYear + 1, month - 1, 1, 0, 0, 0, 0);
  end.setDate(end.getDate() - 1);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Human-readable label for a financial year code, e.g. 'FY2627 (Apr 2026 - Mar 2027)'.
 */
export function getFinancialYearLabel(financialYear: string, startMonth?: number): string {
  const month = normaliseStartMonth(startMonth);
  try {
    const { start, end } = getFinancialYearDateRange(financialYear, month);
    const fmt = (d: Date): string => `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
    return `${financialYear} (${fmt(start)} - ${fmt(end)})`;
  } catch {
    return financialYear;
  }
}

/**
 * Get financial year code for a date.
 * FY2526 = April 1, 2025 to March 31, 2026
 * If date is April or later: FY{YY}{YY+1}
 * If date is Jan-Mar: FY{YY-1}{YY}
 */
export function getFinancialYearCode(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed: Jan=0, Apr=3

  if (month >= 3) {
    // April (3) or later -> current FY
    return `FY${String(year).slice(-2)}${String(year + 1).slice(-2)}`;
  }
  // Jan, Feb, Mar -> previous FY
  return `FY${String(year - 1).slice(-2)}${String(year).slice(-2)}`;
}

/**
 * Get last N financial year codes including current.
 * E.g. getLastFinancialYearCodes(3) -> ['FY2526', 'FY2425', 'FY2324'] when current is FY2526
 */
export function getLastFinancialYearCodes(count: number): string[] {
  const current = getFinancialYearCode(new Date());
  const match = current.match(/^FY(\d{2})(\d{2})$/);
  if (!match) return [current];
  const codes: string[] = [];
  let startYY = parseInt(match[1]!, 10);
  let endYY = parseInt(match[2]!, 10);
  for (let i = 0; i < count; i++) {
    codes.push(`FY${String(startYY).padStart(2, '0')}${String(endYY).padStart(2, '0')}`);
    startYY -= 1;
    endYY -= 1;
  }
  return codes;
}

/**
 * Get date range for a financial year code.
 * FY2526 -> April 1, 2025 to March 31, 2026
 */
export function getFinancialYearDateRange(financialYear: string): { start: Date; end: Date } {
  const match = financialYear.match(/^FY(\d{2})(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid financial year code: ${financialYear}`);
  }
  const startYear = 2000 + parseInt(match[1]!, 10);
  const endYear = 2000 + parseInt(match[2]!, 10);
  return {
    start: new Date(startYear, 3, 1), // April 1
    end: new Date(endYear, 2, 31), // March 31
  };
}

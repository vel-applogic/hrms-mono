/**
 * Date utility functions for safe timezone handling
 *
 * IMPORTANT: All date-only fields from the database (PostgreSQL DATE type)
 * must be parsed using these utilities to ensure consistent behavior across
 * different environments (local development vs UTC production on ECS).
 *
 * PostgreSQL DATE fields are returned as date-only strings (e.g., "2025-01-15")
 * without timezone information. JavaScript's Date constructor interprets these
 * differently based on the server's timezone, which can cause off-by-one day errors.
 *
 * These utilities ensure all dates are consistently treated as UTC midnight.
 */

/**
 * Parse a date-only value from the database as UTC midnight
 *
 * This function ensures that date-only fields (PostgreSQL DATE type) are
 * consistently interpreted as UTC midnight, regardless of the server's timezone.
 *
 * @param date - Date value from database (Date object or string)
 * @returns Date object representing UTC midnight of the given date
 *
 * @example
 * // Database returns: "2025-01-15"
 * const date = parseDateOnlyAsUTC("2025-01-15");
 * // Returns: Date object for 2025-01-15T00:00:00.000Z
 *
 * @example
 * // With Date object from Prisma
 * const booking = await prisma.requirementHasListing.findFirst();
 * const startDate = parseDateOnlyAsUTC(booking.startDate);
 */
export function parseDateOnlyAsUTC(date: Date | string | null | undefined): Date | null {
  if (!date) {
    return null;
  }

  // If it's already a Date object, extract the date components
  // and reconstruct as UTC to avoid timezone shifts
  if (date instanceof Date) {
    // Get the date components in UTC
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }

  // If it's a string, parse it explicitly as UTC
  // Date strings from PostgreSQL DATE fields are in format: "YYYY-MM-DD"
  const dateString = date.trim();

  // Parse YYYY-MM-DD format
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match || !match[1] || !match[2] || !match[3]) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD format.`);
  }

  const yearStr = match[1];
  const monthStr = match[2];
  const dayStr = match[3];
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-indexed
  const day = parseInt(dayStr, 10);

  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Get current date at UTC midnight (strips time component)
 *
 * Useful for creating invoice dates, due dates, etc. that should be
 * date-only values without time components.
 *
 * @returns Date object representing today at UTC midnight
 *
 * @example
 * const invoiceDate = getCurrentDateUTC();
 * // Returns: Today's date at 00:00:00 UTC
 */
export function getCurrentDateUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Create a UTC date from year, month, and day components
 *
 * Useful for constructing month boundaries and other date calculations.
 *
 * @param year - Full year (e.g., 2025)
 * @param month - Month (1-12, NOT 0-indexed)
 * @param day - Day of month (1-31)
 * @returns Date object representing the specified date at UTC midnight
 *
 * @example
 * const monthStart = createUTCDate(2025, 1, 1);
 * // Returns: 2025-01-01T00:00:00.000Z
 */
export function createUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Convert a date to an ISO string
 *
 * @param date - Date object
 * @returns ISO string
 *
 * @example
 * const isoString = toISOString(new Date());
 * // Returns: "2025-01-01T00:00:00.000Z"
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

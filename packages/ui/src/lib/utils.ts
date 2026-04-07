import { FilterRequestType, SearchParamsType, SortDirectionDtoEnum } from '@repo/dto';
import { type ClassValue, clsx } from 'clsx';
import { format as formatDateFns } from 'date-fns';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

// Mirror of @repo/shared/constants — kept inline to avoid an extra cross-package dep.
// Update both places together. date-fns format tokens.
const DATE_FORMAT = 'dd-MMM-yyyy';
const TIME_FORMAT = 'hh:mm a';
const DATE_TIME_FORMAT = 'dd-MMM-yyyy hh:mm a';

import { FormattedValidationErrorType, ServerErrorType, ServerErrorTypeSchema } from './safe-action-error';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display in the UI.
 *
 * Always uses `DATE_FORMAT` from `@repo/shared` (`dd-MMM-yyyy`) so date display
 * is consistent across the entire app. Accepts `Date | string | null | undefined`
 * — returns an empty string for nullish or invalid input.
 */
export function formatDate(date: Date | string | null | undefined): string {
  const d = toDate(date);
  return d ? formatDateFns(d, DATE_FORMAT) : '';
}

/**
 * Format a date+time for display in the UI using `DATE_TIME_FORMAT` from `@repo/shared`.
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  const d = toDate(date);
  return d ? formatDateFns(d, DATE_TIME_FORMAT) : '';
}

/**
 * Format only the time portion of a date for display using `TIME_FORMAT` from `@repo/shared`.
 */
export function formatTime(date: Date | string | null | undefined): string {
  const d = toDate(date);
  return d ? formatDateFns(d, TIME_FORMAT) : '';
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? null : d;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatAddress(props: { addressLine1: string; addressLine2: string; addressLine3?: string; city: string; country: string; postcode: string }): string {
  return `${props.addressLine1}, ${props.addressLine2}, ${props.addressLine3 ? `${props.addressLine3},` : ''} ${props.city}, ${props.postcode}, ${props.country}`;
}

export function formatName(firstname?: string, lastname?: string): string {
  return [firstname, lastname].filter((v) => v != null && v.trim().length).join(' ');
}

const objectToParts = (obj: Record<string, unknown>, keyPrefix = ''): string[] => {
  const parts: string[] = [];
  for (const key of Object.keys(obj)) {
    if (obj[key] != null && obj[key] !== '') {
      if (typeof obj[key] != 'object' || (Array.isArray(obj[key]) && obj[key].length)) {
        let value = obj[key];
        if (Array.isArray(obj[key])) {
          value = obj[key].join(',');
        }
        parts.push(`${keyPrefix}${key}=${encodeURIComponent(value as string)}`);
      } else if (typeof obj[key] == 'object') {
        parts.push(...objectToParts(obj[key] as Record<string, unknown>, `${key}_`));
      }
    }
  }

  return parts;
};
export const objectToQueryString = (obj?: Record<string, unknown>): string | undefined => {
  const parts = obj ? objectToParts(obj) : [];

  if (parts.length) {
    return parts.join('&');
  }

  return '';
};

// TODO remove string
export function getPage(value?: number | string): number {
  try {
    if (value && typeof value == 'string' && Number.isInteger(parseInt(value))) {
      return parseInt(value);
    } else if (value && typeof value == 'number') {
      return value;
    }
  } catch (e) {
    // empty
  }
  return 1;
}

// TODO remove string
export function getPageSize(value?: number | string): number {
  try {
    if (value && typeof value == 'string' && Number.isInteger(parseInt(value))) {
      return parseInt(value);
    } else if (value && typeof value == 'number') {
      return value;
    }
  } catch (e) {
    // empty
  }
  return 50;
}

export const pageSearcParamsToFilterRequestType = (searchParams: SearchParamsType): FilterRequestType => {
  const page = getPage(searchParams?.page);
  const pageSize = getPageSize(searchParams?.pageSize);

  const filterRequest: FilterRequestType = {
    search: searchParams.search,
    pagination: {
      page: page,
      limit: pageSize,
    },
  };
  if (searchParams.sKey && searchParams.sVal) {
    const sortDirection = searchParams.sVal === 'desc' ? SortDirectionDtoEnum.DESC : searchParams.sVal === 'asc' ? SortDirectionDtoEnum.ASC : undefined;
    if (sortDirection) {
      filterRequest.sort = { field: searchParams.sKey, direction: sortDirection };
    }
  }

  return filterRequest;
};

export const formSetErrors = <T extends FieldValues>(form: UseFormReturn<T>, errors: FormattedValidationErrorType) => {
  for (const fKey of Object.keys(errors)) {
    form.setError(fKey as any, { message: errors[fKey as any]!.join(' ') });
  }
};

export const getErrorMessage = (err: ServerErrorType): string => {
  try {
    const serverError = ServerErrorTypeSchema.parse(err);
    if (serverError.generalError) {
      return serverError.generalError;
    }
  } catch (e) {}

  if (err instanceof Error) {
    if (err.message) {
      return err.message;
    }
  }
  return 'Unexpected error';
};

export const formatId = (id: number, prefix: string = 'HRMS'): string => {
  let idString = '';
  if (id > 9999) {
    idString = `${prefix}-${id}`;
  } else {
    idString = `000${id}`.slice(-4);
  }
  return `${prefix}-${idString}`;
};

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp';
};

export const getFileType = (fileName: string): 'image' | 'video' | 'audio' | 'file' => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp' || ext === 'svg') {
    return 'image';
  } else if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv' || ext === 'webm') {
    return 'video';
  } else if (ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'm4a' || ext === 'aac') {
    return 'audio';
  }

  return 'file';
};

/**
 * Normalizes string | string[] to string[] | undefined
 * Useful for handling Next.js URL params where single value = string, multiple values = array
 */
export const toArray = (value: string | string[] | undefined): string[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
};

/**
 * Normalizes string | string[] to number[] | undefined
 * Useful for handling Next.js URL params where values need to be converted to numbers
 */
export const toNumberArray = (value: string | string[] | undefined): number[] | undefined => {
  if (!value) return undefined;
  const arr = Array.isArray(value) ? value : [value];
  return arr.map(Number);
};

/**
 * Normalizes string | string[] to enum array using a converter function
 * Useful for handling Next.js URL params where values need to be converted to enums
 */
export const toEnumArray = <T>(value: string | string[] | undefined, converter: (value: string) => T): T[] | undefined => {
  if (!value) return undefined;
  const arr = Array.isArray(value) ? value : [value];
  return arr.map(converter);
};

/**
 * Check if a column is sortable based on sortable columns array
 * @param field - The field name to check
 * @param sortableColumns - Array of sortable column names
 * @returns boolean indicating if the column is sortable
 */
export const isSortable = (field: string, sortableColumns: readonly string[]): boolean => {
  return sortableColumns.includes(field);
};

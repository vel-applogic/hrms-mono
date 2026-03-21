'use client';

import { cn } from '@repo/ui/lib/utils';
import * as React from 'react';

import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

function isValidYear(yearStr: string): boolean {
  const year = parseInt(yearStr, 10);
  return /^\d{4}$/.test(yearStr.trim()) && !isNaN(year) && year >= MIN_YEAR && year <= MAX_YEAR;
}

/**
 * Parses value as "YYYY-MM" or "YYYY-MM-DD" and returns { year, month } for display.
 */
function parseValue(value: string | undefined): { year: string; month: string } | null {
  if (!value?.trim()) return null;
  const parts = value.trim().split('-');
  if (parts.length >= 2) {
    const year = parts[0]!;
    const month = parts[1]!.padStart(2, '0');
    if (/^\d{4}$/.test(year) && /^\d{2}$/.test(month)) {
      return { year, month };
    }
  }
  return null;
}

export interface MonthYearPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onError?: (error: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

/**
 * Month and year picker. Value format: "YYYY-MM".
 * When saving to API/DB, use the 1st of the selected month.
 */
export const MonthYearPicker = React.forwardRef<HTMLDivElement, MonthYearPickerProps>(
  ({ value, onChange, onError, placeholder = 'Select month & year', className, disabled }, ref) => {
    const parsed = parseValue(value);
    const monthValue = parsed?.month ?? '';
    const [yearInput, setYearInput] = React.useState(parsed?.year ?? String(CURRENT_YEAR));
    const [yearError, setYearError] = React.useState<string | undefined>();

    React.useEffect(() => {
      const year = parsed?.year ?? String(CURRENT_YEAR);
      setYearInput(year);
    }, [parsed?.year]);

    const updateYearError = React.useCallback(
      (error: string | undefined) => {
        setYearError(error);
        onError?.(error);
      },
      [onError],
    );

    const handleMonthChange = (month: string) => {
      const year = yearInput.trim() || String(CURRENT_YEAR);
      if (isValidYear(year)) {
        updateYearError(undefined);
        onChange?.(`${year}-${month}`);
      } else {
        updateYearError(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}`);
      }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      setYearInput(raw);
      if (raw.length < 4) {
        updateYearError(undefined);
        return;
      }
      if (isValidYear(raw)) {
        updateYearError(undefined);
        const month = monthValue || '01';
        onChange?.(`${raw}-${month}`);
      } else {
        const year = parseInt(raw, 10);
        const err = year < MIN_YEAR || year > MAX_YEAR ? `Year must be between ${MIN_YEAR} and ${MAX_YEAR}` : 'Year must be a 4-digit number';
        updateYearError(err);
      }
    };

    const handleYearBlur = () => {
      if (!yearInput.trim()) {
        setYearInput(String(CURRENT_YEAR));
        updateYearError(undefined);
        const month = monthValue || '01';
        onChange?.(`${CURRENT_YEAR}-${month}`);
      } else if (yearInput.length === 4 && !isValidYear(yearInput)) {
        const year = parseInt(yearInput, 10);
        const err = year < MIN_YEAR || year > MAX_YEAR ? `Year must be between ${MIN_YEAR} and ${MAX_YEAR}` : 'Invalid year';
        updateYearError(err);
      }
    };

    return (
      <div ref={ref} className={cn('flex gap-2', className)}>
        <Select value={monthValue || undefined} onValueChange={handleMonthChange} disabled={disabled}>
          <SelectTrigger className='flex-1'>
            <SelectValue placeholder='Month' />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type='text'
          inputMode='numeric'
          maxLength={4}
          value={yearInput}
          onChange={handleYearChange}
          onBlur={handleYearBlur}
          placeholder={String(CURRENT_YEAR)}
          disabled={disabled}
          className={cn('w-[100px]', yearError && 'border-destructive')}
          aria-invalid={!!yearError}
        />
      </div>
    );
  },
);
MonthYearPicker.displayName = 'MonthYearPicker';

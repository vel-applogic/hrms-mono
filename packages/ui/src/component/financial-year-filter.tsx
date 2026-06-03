'use client';

import { getLastFinancialYearCodes } from '@repo/shared';
import * as React from 'react';

import { cn } from '../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FinancialYearFilterProps {
  value: string;
  onChange: (value: string) => void;
  /** Financial year start month (1-12). Defaults to April (4) when omitted. */
  startMonth?: number;
  /** Number of financial years to list (newest first). Defaults to 3. */
  count?: number;
  className?: string;
  placeholder?: string;
}

/**
 * Reusable financial-year selector. Derives the list of financial year codes
 * (e.g. FY2627) from the organisation's configured start month.
 */
export function FinancialYearFilter({ value, onChange, startMonth, count = 3, className, placeholder = 'Financial Year' }: FinancialYearFilterProps) {
  const options = React.useMemo(() => {
    const codes = getLastFinancialYearCodes(count, startMonth);
    // Ensure the currently-selected value is always selectable, even if it falls outside the recent window.
    if (value && !codes.includes(value)) {
      codes.unshift(value);
    }
    return codes;
  }, [count, startMonth, value]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('h-10 w-[140px]', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((code) => (
          <SelectItem key={code} value={code}>
            {code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

'use client';

import { LeaveStatusDtoEnum } from '@repo/dto';
import { SelectOption } from '@repo/ui/component/select-search';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';

const STATUS_OPTIONS: SelectOption[] = Object.values(LeaveStatusDtoEnum).map((val) => ({
  label: val.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
  value: val,
}));

interface LeaveStatusFilterProps {
  values?: string[];
  onChange: (values: string[]) => void;
}

export function LeaveStatusFilter({ values, onChange }: LeaveStatusFilterProps) {
  return (
    <SelectSearchMulti
      values={values}
      options={STATUS_OPTIONS}
      placeholder='Status'
      searchPlaceholder='Search status...'
      onChange={onChange}
      className='w-[160px]'
    />
  );
}

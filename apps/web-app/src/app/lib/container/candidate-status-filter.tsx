'use client';

import { CandidateStatusDtoEnum } from '@repo/dto';
import { SelectOption } from '@repo/ui/component/select-search';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';

const STATUS_OPTIONS: SelectOption[] = Object.values(CandidateStatusDtoEnum).map((val) => ({
  label: val.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
  value: val,
}));

interface CandidateStatusFilterProps {
  values?: string[];
  onChange: (values: string[]) => void;
}

export function CandidateStatusFilter({ values, onChange }: CandidateStatusFilterProps) {
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

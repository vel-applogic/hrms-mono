'use client';

import { CandidateSourceDtoEnum } from '@repo/dto';
import { SelectOption } from '@repo/ui/component/select-search';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';

const SOURCE_OPTIONS: SelectOption[] = Object.values(CandidateSourceDtoEnum).map((val) => ({
  label: val.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
  value: val,
}));

interface CandidateSourceFilterProps {
  values?: string[];
  onChange: (values: string[]) => void;
}

export function CandidateSourceFilter({ values, onChange }: CandidateSourceFilterProps) {
  return (
    <SelectSearchMulti
      values={values}
      options={SOURCE_OPTIONS}
      placeholder='Source'
      searchPlaceholder='Search source...'
      onChange={onChange}
      className='w-[160px]'
    />
  );
}

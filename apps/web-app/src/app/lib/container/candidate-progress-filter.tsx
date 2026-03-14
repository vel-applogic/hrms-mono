'use client';

import { CandidateProgressDtoEnum } from '@repo/dto';
import { SelectOption } from '@repo/ui/component/select-search';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';

const PROGRESS_OPTIONS: SelectOption[] = Object.values(CandidateProgressDtoEnum).map((val) => ({
  label: val
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/Lev (\d)/g, 'Level $1'),
  value: val,
}));

interface CandidateProgressFilterProps {
  values?: string[];
  onChange: (values: string[]) => void;
}

export function CandidateProgressFilter({ values, onChange }: CandidateProgressFilterProps) {
  return (
    <SelectSearchMulti
      values={values}
      options={PROGRESS_OPTIONS}
      placeholder='Progress'
      searchPlaceholder='Search progress...'
      onChange={onChange}
      className='w-[180px]'
    />
  );
}

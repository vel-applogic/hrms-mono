'use client';

import { BranchResponseType } from '@repo/dto';
import { SelectOption } from '@repo/ui/component/select-search';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';

interface BranchFilterProps {
  branches: BranchResponseType[];
  values?: number[];
  onChange: (values: number[]) => void;
}

export function BranchFilter({ branches, values, onChange }: BranchFilterProps) {
  const options: SelectOption[] = branches.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  const stringValues = values?.map(String);

  return (
    <SelectSearchMulti
      values={stringValues}
      options={options}
      placeholder='Branch'
      searchPlaceholder='Search branch...'
      onChange={(vals) => onChange(vals.map(Number))}
      className='w-[160px]'
    />
  );
}

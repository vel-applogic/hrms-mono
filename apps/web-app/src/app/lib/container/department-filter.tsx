'use client';

import { DepartmentResponseType } from '@repo/dto';
import { SelectOption } from '@repo/ui/component/select-search';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';

interface DepartmentFilterProps {
  departments: DepartmentResponseType[];
  values?: number[];
  onChange: (values: number[]) => void;
}

export function DepartmentFilter({ departments, values, onChange }: DepartmentFilterProps) {
  const options: SelectOption[] = departments.map((d) => ({
    label: d.name,
    value: String(d.id),
  }));

  const stringValues = values?.map(String);

  return (
    <SelectSearchMulti
      values={stringValues}
      options={options}
      placeholder='Department'
      searchPlaceholder='Search department...'
      onChange={(vals) => onChange(vals.map(Number))}
      className='w-[160px]'
    />
  );
}

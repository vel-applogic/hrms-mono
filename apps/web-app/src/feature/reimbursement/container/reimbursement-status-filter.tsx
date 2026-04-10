'use client';

import { ReimbursementStatusDtoEnum } from '@repo/dto';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';

interface Props {
  values: string[] | undefined;
  onChange: (values: string[]) => void;
}

const statusOptions = Object.values(ReimbursementStatusDtoEnum).map((s) => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}));

export const ReimbursementStatusFilter = ({ values, onChange }: Props) => {
  return (
    <SelectSearchMulti
      values={values ?? []}
      options={statusOptions}
      placeholder='Status'
      searchPlaceholder='Search status...'
      onChange={onChange}
      className='w-[160px]'
    />
  );
};

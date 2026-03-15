'use client';

import type { EmployeeListResponseType } from '@repo/dto';
import { Label } from '@repo/ui/component/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/component/shadcn/select';
import { useEffect, useMemo, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';

interface Props {
  value?: number;
  onChange: (userId: number) => void;
  disabled?: boolean;
  placeholder?: string;
  /** When set, non-admin users only see themselves in the list */
  currentUserId?: number | null;
  isAdmin?: boolean;
}

export function EmployeeSelect({
  value,
  onChange,
  disabled,
  placeholder = 'Select employee',
  currentUserId,
  isAdmin,
}: Props) {
  const [employees, setEmployees] = useState<EmployeeListResponseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployeesList()
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo(() => {
    if (isAdmin) return employees;
    if (currentUserId) return employees.filter((e) => e.id === currentUserId);
    return employees;
  }, [employees, currentUserId, isAdmin]);

  return (
    <div className='flex flex-col gap-2'>
      <Label>Employee</Label>
      <Select
        value={value !== undefined ? String(value) : ''}
        onValueChange={(val) => onChange(Number(val))}
        disabled={disabled || loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? 'Loading...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((e) => (
            <SelectItem key={e.id} value={String(e.id)}>
              {e.firstname} {e.lastname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

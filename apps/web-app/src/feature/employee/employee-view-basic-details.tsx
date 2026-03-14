'use client';

import type { EmployeeDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getEmployeeById } from '@/lib/action/employee.actions';

import { EmployeeUpsertDrawer } from './container/employee-upsert.drawer';

interface Props {
  employeeId: number;
}

export function EmployeeViewBasicDetails({ employeeId }: Props) {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeDetailResponseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const fetchEmployee = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployeeById(employeeId);
      setEmployee(data);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void fetchEmployee();
  }, [fetchEmployee]);

  const handleEditSuccess = () => {
    setEditDrawerOpen(false);
    void fetchEmployee();
    router.refresh();
  };

  if (loading || !employee) {
    return <p className='text-sm text-muted-foreground'>Loading...</p>;
  }

  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Employee Details</h2>
        <Button size='sm' onClick={() => setEditDrawerOpen(true)}>
          <Pencil className='h-4 w-4' />
          Edit
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>First name</Label>
          <p className='text-sm font-medium'>{employee.firstname}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Last name</Label>
          <p className='text-sm font-medium'>{employee.lastname}</p>
        </div>
        <div className='flex flex-col gap-2 md:col-span-2'>
          <Label className='text-muted-foreground'>Email</Label>
          <p className='text-sm font-medium'>{employee.email}</p>
        </div>
        <div className='flex flex-col gap-2 md:col-span-2'>
          <Label className='text-muted-foreground'>Personal email</Label>
          <p className='text-sm font-medium'>{employee.personalEmail ?? '—'}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Date of birth</Label>
          <p className='text-sm font-medium'>{employee.dob}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Designation</Label>
          <p className='text-sm font-medium'>{employee.designation}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>PAN</Label>
          <p className='text-sm font-medium'>{employee.pan}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Aadhaar</Label>
          <p className='text-sm font-medium'>{employee.aadhaar}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Status</Label>
          <p className='text-sm font-medium'>{employee.status}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Date of joining</Label>
          <p className='text-sm font-medium'>{employee.dateOfJoining}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Date of leaving</Label>
          <p className='text-sm font-medium'>{employee.dateOfLeaving ?? '—'}</p>
        </div>
        <div className='flex flex-col gap-2 md:col-span-2'>
          <Label className='text-muted-foreground'>Reports to</Label>
          <p className='text-sm font-medium'>
            {employee.reportTo ? `${employee.reportTo.firstname} ${employee.reportTo.lastname}` : '—'}
          </p>
        </div>
      </div>

      <EmployeeUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} employee={employee} onSuccess={handleEditSuccess} />
    </>
  );
}

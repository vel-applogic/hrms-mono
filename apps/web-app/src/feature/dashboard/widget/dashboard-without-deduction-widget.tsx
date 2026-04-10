'use client';

import { EmployeeStatusDtoEnum } from '@repo/dto';
import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
import { FileWarning } from 'lucide-react';
import { useEffect, useState } from 'react';

import { searchEmployeeDeductions } from '@/lib/action/employee-deduction.actions';
import { getEmployeesList } from '@/lib/action/employee.actions';

type NameEntry = { id: number; firstname: string; lastname: string };

export function DashboardWithoutDeduction() {
  const [entries, setEntries] = useState<NameEntry[] | null>(null);

  useEffect(() => {
    getEmployeesList().then(async (employees) => {
      const active = employees.filter((e) => e.status === EmployeeStatusDtoEnum.active);
      const checks = await Promise.all(
        active.map(async (e) => {
          const result = await searchEmployeeDeductions({ employeeId: e.id, pagination: { page: 1, limit: 1 } });
          return { id: e.id, firstname: e.firstname, lastname: e.lastname, has: result.totalRecords > 0 };
        }),
      );
      setEntries(checks.filter((d) => !d.has).map((d) => ({ id: d.id, firstname: d.firstname, lastname: d.lastname })));
    });
  }, []);

  return (
    <DashboardWidget>
      <div className='flex w-full items-start gap-5'>
        <DashboardWidgetIcon icon={FileWarning} />
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='text-sm font-semibold text-muted-foreground'>Without Deduction</span>
          {entries === null ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <span className={`text-3xl font-semibold ${entries.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{entries.length}</span>
          )}
          {entries && entries.length > 0 && (
            <p className='mt-2 text-sm text-muted-foreground'>{entries.map((e) => `${e.firstname} ${e.lastname}`).join(', ')}</p>
          )}
        </div>
      </div>
    </DashboardWidget>
  );
}

'use client';

import { EmployeeStatusDtoEnum } from '@repo/dto';
import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
import { FileWarning } from 'lucide-react';
import { useEffect, useState } from 'react';

import { searchPayrollActiveCompensations } from '@/lib/action/employee-compensation.actions';
import { getEmployeesList } from '@/lib/action/employee.actions';

type NameEntry = { id: number; firstname: string; lastname: string };

export function DashboardWithoutCompensation() {
  const [entries, setEntries] = useState<NameEntry[] | null>(null);

  useEffect(() => {
    Promise.all([
      getEmployeesList(),
      searchPayrollActiveCompensations({ pagination: { page: 1, limit: 500 } }),
    ]).then(([employees, compensations]) => {
      const active = employees.filter((e) => e.status === EmployeeStatusDtoEnum.active);
      const idsWithComp = new Set(compensations.results.map((c) => c.employeeId));
      setEntries(active.filter((e) => !idsWithComp.has(e.id)).map((e) => ({ id: e.id, firstname: e.firstname, lastname: e.lastname })));
    });
  }, []);

  return (
    <DashboardWidget>
      <div className='flex w-full flex-col gap-3'>
        <span className='text-sm font-semibold text-muted-foreground'>Without Compensation</span>
        <div className='flex items-start gap-5'>
          <DashboardWidgetIcon icon={FileWarning} />
          <div className='flex min-w-0 flex-1 flex-col'>
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
      </div>
    </DashboardWidget>
  );
}

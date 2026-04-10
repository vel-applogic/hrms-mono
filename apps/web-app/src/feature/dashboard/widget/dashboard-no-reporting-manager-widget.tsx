'use client';

import { EmployeeStatusDtoEnum } from '@repo/dto';
import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';

type NameEntry = { id: number; firstname: string; lastname: string };

export function DashboardNoReportingManager() {
  const [entries, setEntries] = useState<NameEntry[] | null>(null);

  useEffect(() => {
    getEmployeesList().then((employees) => {
      const active = employees.filter((e) => e.status === EmployeeStatusDtoEnum.active);
      setEntries(active.filter((e) => !e.reportToId).map((e) => ({ id: e.id, firstname: e.firstname, lastname: e.lastname })));
    });
  }, []);

  return (
    <DashboardWidget colSpan={2}>
      <div className='flex w-full items-start gap-5'>
        <DashboardWidgetIcon icon={AlertTriangle} />
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='text-sm font-semibold text-muted-foreground'>No Reporting Manager</span>
          {entries === null ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <span className={`text-3xl font-semibold ${entries.length > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{entries.length}</span>
          )}
          {entries && entries.length > 0 && (
            <p className='mt-2 text-sm text-muted-foreground'>{entries.map((e) => `${e.firstname} ${e.lastname}`).join(', ')}</p>
          )}
        </div>
      </div>
    </DashboardWidget>
  );
}

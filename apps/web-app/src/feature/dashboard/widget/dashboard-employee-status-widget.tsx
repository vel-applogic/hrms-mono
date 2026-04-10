'use client';

import { EmployeeStatusDtoEnum } from '@repo/dto';
import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-emerald-600' },
  resigned: { label: 'Resigned', color: 'text-amber-600' },
  onLeave: { label: 'On Leave', color: 'text-sky-600' },
  terminated: { label: 'Terminated', color: 'text-red-500' },
};

export function DashboardEmployeeStatus() {
  const [statusCounts, setStatusCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    getEmployeesList().then((employees) => {
      const counts: Record<string, number> = {};
      for (const emp of employees) {
        counts[emp.status] = (counts[emp.status] ?? 0) + 1;
      }
      setStatusCounts(counts);
    });
  }, []);

  return (
    <DashboardWidget colSpan={2} href='/employee'>
      <div className='flex w-full flex-col gap-3'>
        <span className='text-sm font-semibold text-muted-foreground'>Employees by Status</span>
        <div className='flex items-start gap-4'>
          <DashboardWidgetIcon icon={Users} />
          <div className='flex min-w-0 flex-1 flex-col'>
          {statusCounts === null ? (
            <div className='h-12 animate-pulse rounded bg-muted' />
          ) : (
            <div className='flex flex-wrap gap-4'>
              {Object.values(EmployeeStatusDtoEnum).map((status) => {
                const info = STATUS_LABELS[status];
                return (
                  <div key={status} className='flex flex-col'>
                    <span className={`text-2xl font-semibold ${info?.color ?? ''}`}>{statusCounts[status] ?? 0}</span>
                    <span className='text-xs text-muted-foreground'>{info?.label ?? status}</span>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}

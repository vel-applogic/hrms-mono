'use client';

import { Widget, WidgetInnerMultipleCounter } from '@repo/ui/component/ui/dashboard-widget';
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
    <Widget label='Employees by Status' icon={Users} colSpan={2} href='/employee'>
      <WidgetInnerMultipleCounter
        values={
          statusCounts
            ? Object.entries(STATUS_LABELS).map(([key, status]) => ({
                value: statusCounts[key] ?? 0,
                valueColor: STATUS_LABELS[key]?.color ?? '',
                label: STATUS_LABELS[key]?.label ?? status,
              }))
            : null
        }
      />
    </Widget>
  );
}

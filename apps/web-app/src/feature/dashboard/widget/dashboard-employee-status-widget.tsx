'use client';

import type { DashboardStatsResponseType } from '@repo/dto';
import { Widget, WidgetInnerMultipleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { Users } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-emerald-600' },
  resigned: { label: 'Resigned', color: 'text-amber-600' },
  onLeave: { label: 'On Leave', color: 'text-sky-600' },
  terminated: { label: 'Terminated', color: 'text-red-500' },
};

interface Props {
  stats: DashboardStatsResponseType | null;
}

export function DashboardEmployeeStatus({ stats }: Props) {
  const statusCounts = stats
    ? Object.fromEntries(stats.employeeCountByStatus.map((s) => [s.status, s.count]))
    : null;

  return (
    <Widget label='Employees by Status' icon={Users} colSpan={2} href='/employee'>
      <WidgetInnerMultipleCounter
        values={
          statusCounts
            ? Object.entries(STATUS_LABELS).map(([key, meta]) => ({
                value: statusCounts[key] ?? 0,
                valueColor: meta.color,
                label: meta.label,
              }))
            : null
        }
      />
    </Widget>
  );
}

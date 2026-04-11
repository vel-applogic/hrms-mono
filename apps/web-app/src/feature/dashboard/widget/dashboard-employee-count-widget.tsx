'use client';

import type { DashboardStatsResponseType } from '@repo/dto';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { Users } from 'lucide-react';

interface Props {
  stats: DashboardStatsResponseType | null;
}

export function DashboardEmployeeCount({ stats }: Props) {
  const count = stats
    ? stats.employeeCountByStatus.find((s) => s.status === 'active')?.count ?? 0
    : null;

  return (
    <Widget label='Employees' icon={Users} href='/employee'>
      <WidgetInnerSingleCounter value={count} valueColor='text-primary' />
    </Widget>
  );
}

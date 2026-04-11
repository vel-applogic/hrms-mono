'use client';

import type { DashboardStatsResponseType } from '@repo/dto';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { AlertTriangle } from 'lucide-react';

interface Props {
  stats: DashboardStatsResponseType | null;
}

export function DashboardNoReportingManager({ stats }: Props) {
  const count = stats?.employeesWithoutReportTo ?? null;

  return (
    <Widget label='No Reporting Manager' icon={AlertTriangle} colSpan={2}>
      <WidgetInnerSingleCounter
        value={count}
        valueColor={count !== null && count > 0 ? 'text-amber-600' : 'text-emerald-600'}
      />
    </Widget>
  );
}

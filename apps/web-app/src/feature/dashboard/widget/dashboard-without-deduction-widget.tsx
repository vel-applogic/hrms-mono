'use client';

import type { DashboardStatsResponseType } from '@repo/dto';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { FileWarning } from 'lucide-react';

interface Props {
  stats: DashboardStatsResponseType | null;
}

export function DashboardWithoutDeduction({ stats }: Props) {
  const count = stats?.employeesWithoutDeduction ?? null;

  return (
    <Widget label='Without Deduction' icon={FileWarning}>
      <WidgetInnerSingleCounter
        value={count}
        valueColor={count !== null && count > 0 ? 'text-amber-600' : 'text-emerald-600'}
      />
    </Widget>
  );
}

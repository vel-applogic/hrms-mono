'use client';

import type { DashboardStatsResponseType } from '@repo/dto';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { UserRound } from 'lucide-react';

interface Props {
  stats: DashboardStatsResponseType | null;
}

export function DashboardCandidateCount({ stats }: Props) {
  const count = stats
    ? stats.candidateCountByStatus.find((s) => s.status === 'new')?.count ?? 0
    : null;

  return (
    <Widget label='New Candidates' icon={UserRound} href='/candidate'>
      <WidgetInnerSingleCounter value={count} valueColor='text-sky-600' />
    </Widget>
  );
}

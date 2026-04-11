'use client';

import type { DashboardStatsResponseType } from '@repo/dto';
import { Widget, WidgetInnerMultipleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { UserRound } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'text-sky-600' },
  planed: { label: 'Planned', color: 'text-indigo-600' },
  notReachable: { label: 'Not Reachable', color: 'text-amber-600' },
  selected: { label: 'Selected', color: 'text-emerald-600' },
  onHold: { label: 'On Hold', color: 'text-orange-500' },
  rejected: { label: 'Rejected', color: 'text-red-500' },
};

interface Props {
  stats: DashboardStatsResponseType | null;
}

export function DashboardCandidateStatus({ stats }: Props) {
  const statusCounts = stats
    ? Object.fromEntries(stats.candidateCountByStatus.map((s) => [s.status, s.count]))
    : null;

  return (
    <Widget label='Candidates by Status' icon={UserRound} colSpan={2} href='/candidate'>
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

'use client';

import { Widget, WidgetInnerMultipleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getCandidatesList } from '@/lib/action/candidate.actions';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'text-sky-600' },
  planed: { label: 'Planned', color: 'text-indigo-600' },
  notReachable: { label: 'Not Reachable', color: 'text-amber-600' },
  selected: { label: 'Selected', color: 'text-emerald-600' },
  onHold: { label: 'On Hold', color: 'text-orange-500' },
  rejected: { label: 'Rejected', color: 'text-red-500' },
};

export function DashboardCandidateStatus() {
  const [statusCounts, setStatusCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    getCandidatesList().then((candidates) => {
      const counts: Record<string, number> = {};
      for (const c of candidates) {
        counts[c.status] = (counts[c.status] ?? 0) + 1;
      }
      setStatusCounts(counts);
    });
  }, []);

  return (
    <Widget label='Candidates by Status' icon={UserRound} colSpan={2} href='/candidate'>
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

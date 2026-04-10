'use client';

import { CandidateStatusDtoEnum } from '@repo/dto';
import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
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
    <DashboardWidget colSpan={2} href='/candidate'>
      <div className='flex w-full flex-col gap-3'>
        <span className='text-sm font-semibold text-muted-foreground'>Candidates by Status</span>
        <div className='flex items-start gap-4'>
          <DashboardWidgetIcon icon={UserRound} />
          <div className='flex min-w-0 flex-1 flex-col'>
          {statusCounts === null ? (
            <div className='h-12 animate-pulse rounded bg-muted' />
          ) : (
            <div className='flex flex-wrap gap-4'>
              {Object.values(CandidateStatusDtoEnum).map((status) => {
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

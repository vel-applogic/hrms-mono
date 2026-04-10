'use client';

import { LeaveStatusDtoEnum } from '@repo/dto';
import { DashboardWidget } from '@repo/ui/component/ui/dashboard-widget';
import { useEffect, useState } from 'react';

import { searchLeaves } from '@/lib/action/leave.actions';

type LeaveEntry = { userId: number; firstname: string; lastname: string; startDate: string; endDate: string };

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DashboardLeaveNext7Day() {
  const [entries, setEntries] = useState<LeaveEntry[] | null>(null);

  useEffect(() => {
    searchLeaves({
      pagination: { page: 1, limit: 500 },
      status: [LeaveStatusDtoEnum.approved],
    }).then((result) => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]!;
      const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0]!;
      const next7 = new Date(today);
      next7.setDate(next7.getDate() + 7);
      const next7Str = next7.toISOString().split('T')[0]!;

      setEntries(
        result.results
          .filter((l) => {
            const overlaps = l.startDate <= next7Str && l.endDate >= tomorrowStr;
            const isToday = l.startDate <= todayStr && l.endDate >= todayStr;
            return overlaps && !isToday;
          })
          .map((l) => ({ userId: l.userId, firstname: l.user.firstname, lastname: l.user.lastname, startDate: l.startDate, endDate: l.endDate })),
      );
    });
  }, []);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  const fromDay = tomorrow.getDate();
  const fromMonth = tomorrow.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const toDay = endDate.getDate();
  const toMonth = endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  return (
    <DashboardWidget colSpan={2}>
      <div className='flex w-full items-start gap-5'>
        <div className='flex shrink-0 items-center gap-1.5'>
          <div className='flex w-14 flex-col overflow-hidden rounded-lg border border-border text-center'>
            <div className='bg-primary px-1.5 py-1 text-[10px] font-bold tracking-wider text-primary-foreground'>{fromMonth}</div>
            <div className='flex flex-col items-center justify-center bg-card py-1'>
              <span className='text-xl font-bold leading-tight text-foreground'>{fromDay}</span>
            </div>
          </div>
          <span className='text-xs font-medium text-muted-foreground'>—</span>
          <div className='flex w-14 flex-col overflow-hidden rounded-lg border border-border text-center'>
            <div className='bg-primary px-1.5 py-1 text-[10px] font-bold tracking-wider text-primary-foreground'>{toMonth}</div>
            <div className='flex flex-col items-center justify-center bg-card py-1'>
              <span className='text-xl font-bold leading-tight text-foreground'>{toDay}</span>
            </div>
          </div>
        </div>
        <div className='flex min-w-0 flex-1 flex-col'>
          <div className='mb-2'>
            <span className='text-sm font-semibold text-muted-foreground'>Leaves for Next 7 Days</span>
          </div>
          {entries === null ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : entries.length > 0 ? (
            <div className='flex flex-col gap-1.5'>
              {entries.map((l) => (
                <div key={l.userId} className='flex items-center justify-between gap-4'>
                  <span className='text-sm font-medium'>{l.firstname} {l.lastname}</span>
                  <span className='text-xs text-muted-foreground'>{formatDate(l.startDate)} - {formatDate(l.endDate)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No upcoming leaves</p>
          )}
        </div>
      </div>
    </DashboardWidget>
  );
}

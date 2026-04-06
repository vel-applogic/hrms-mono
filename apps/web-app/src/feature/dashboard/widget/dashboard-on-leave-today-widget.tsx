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

export function DashboardOnLeaveToday() {
  const [entries, setEntries] = useState<LeaveEntry[] | null>(null);

  useEffect(() => {
    searchLeaves({
      pagination: { page: 1, limit: 500 },
      status: [LeaveStatusDtoEnum.approved],
    }).then((result) => {
      const todayStr = new Date().toISOString().split('T')[0]!;
      setEntries(
        result.results
          .filter((l) => l.startDate <= todayStr && l.endDate >= todayStr)
          .map((l) => ({ userId: l.userId, firstname: l.user.firstname, lastname: l.user.lastname, startDate: l.startDate, endDate: l.endDate })),
      );
    });
  }, []);

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = today.getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  return (
    <DashboardWidget colSpan={2}>
      <div className='flex w-full items-start gap-5'>
        <div className='flex w-16 shrink-0 flex-col overflow-hidden rounded-lg border border-border text-center'>
          <div className='bg-primary px-2 py-1 text-[10px] font-bold tracking-wider text-primary-foreground'>{dayName}</div>
          <div className='flex flex-1 flex-col items-center justify-center bg-card py-1'>
            <span className='text-2xl font-bold leading-tight text-foreground'>{dayNum}</span>
            <span className='text-[10px] font-medium text-muted-foreground'>{monthName}</span>
          </div>
        </div>
        <div className='flex min-w-0 flex-1 flex-col'>
          <div className='mb-2'>
            <span className='text-sm font-medium text-muted-foreground'>On Leave Today</span>
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
            <p className='text-sm text-muted-foreground'>No one on leave today</p>
          )}
        </div>
      </div>
    </DashboardWidget>
  );
}

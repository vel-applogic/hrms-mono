'use client';

import { LeaveStatusDtoEnum } from '@repo/dto';
import { Widget, WidgetInnerLabelValueList } from '@repo/ui/component/ui/dashboard-widget';
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
    <Widget
      label='Leaves for Next 7 Days'
      colSpan={2}
      icon={() => (
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
      )}
    >
      <WidgetInnerLabelValueList
        items={entries ? entries.map((l) => ({ label: `${l.firstname} ${l.lastname}`, value: `${formatDate(l.startDate)} - ${formatDate(l.endDate)}` })) : null}
        noRecordMessage='No leaves for the next 7 days'
      />
    </Widget>
  );
}

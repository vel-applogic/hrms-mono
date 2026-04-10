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
    <Widget
      label='On Leave Today'
      colSpan={2}
      icon={() => (
        <div className='flex w-16 shrink-0 flex-col overflow-hidden rounded-lg border border-border text-center'>
          <div className='bg-primary px-2 py-1 text-[10px] font-bold tracking-wider text-primary-foreground'>{dayName}</div>
          <div className='flex flex-1 flex-col items-center justify-center bg-card py-1'>
            <span className='text-2xl font-bold leading-tight text-foreground'>{dayNum}</span>
            <span className='text-[10px] font-medium text-muted-foreground'>{monthName}</span>
          </div>
        </div>
      )}
    >
      <WidgetInnerLabelValueList
        items={entries ? entries.map((l) => ({ label: `${l.firstname} ${l.lastname}`, value: `${formatDate(l.startDate)} - ${formatDate(l.endDate)}` })) : null}
        noRecordMessage='No one on leave today'
      />
    </Widget>
  );
}

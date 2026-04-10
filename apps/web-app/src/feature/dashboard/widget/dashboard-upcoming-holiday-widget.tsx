'use client';

import type { HolidayResponseType } from '@repo/dto';
import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';

import { searchHolidays } from '@/lib/action/holiday.actions';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  isEmployee?: boolean;
}

export function DashboardUpcomingHoliday({ isEmployee }: Props) {
  const [holidays, setHolidays] = useState<HolidayResponseType[] | null>(null);

  useEffect(() => {
    searchHolidays({
      year: new Date().getFullYear(),
      pagination: { page: 1, limit: 100 },
    }).then((result) => {
      const todayStr = new Date().toISOString().split('T')[0]!;
      setHolidays(
        result.results
          .filter((h) => h.date >= todayStr)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 2),
      );
    });
  }, []);

  return (
    <DashboardWidget href={isEmployee ? '/emp/leave/holiday' : '/leaves/holiday'}>
      <div className='flex w-full flex-col gap-3'>
        <span className='text-sm font-semibold text-muted-foreground'>Upcoming Holidays</span>
        <div className='flex items-start gap-4'>
          <DashboardWidgetIcon icon={CalendarDays} />
          <div className='flex min-w-0 flex-1 flex-col'>
          {holidays === null ? (
            <div className='h-12 animate-pulse rounded bg-muted' />
          ) : holidays.length > 0 ? (
            <div className='flex flex-col gap-2'>
              {holidays.map((h) => (
                <div key={h.id} className='flex flex-wrap items-start gap-x-2'>
                  <span className='w-[90px] shrink-0 text-sm text-muted-foreground'>{formatDate(h.date)}</span>
                  <span className='text-sm font-medium'>{h.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No upcoming holidays</p>
          )}
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}

'use client';

import type { HolidayResponseType } from '@repo/dto';
import { Widget, WidgetInnerLabelValueList } from '@repo/ui/component/ui/dashboard-widget';
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
    <Widget label='Upcoming Holidays' icon={CalendarDays} href={isEmployee ? '/emp/leave/holiday' : '/leaves/holiday'}>
      <WidgetInnerLabelValueList items={holidays ? holidays.map((h) => ({ label: formatDate(h.date), value: h.name })) : null} noRecordMessage='No upcoming holidays' />
    </Widget>
  );
}

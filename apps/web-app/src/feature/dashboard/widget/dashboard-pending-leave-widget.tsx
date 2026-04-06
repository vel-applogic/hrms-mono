'use client';

import { LeaveStatusDtoEnum } from '@repo/dto';
import { DashboardWidgetStat } from '@repo/ui/component/ui/dashboard-widget';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { searchLeaves } from '@/lib/action/leave.actions';

export function DashboardPendingLeave() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    searchLeaves({
      pagination: { page: 1, limit: 1 },
      status: [LeaveStatusDtoEnum.pending],
    }).then((result) => setCount(result.totalRecords));
  }, []);

  return <DashboardWidgetStat icon={Clock} label='Leave Approvals Pending' value={count} valueColor='text-amber-600' href='/leaves/approvals' />;
}

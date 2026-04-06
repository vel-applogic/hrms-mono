'use client';

import { LeaveStatusDtoEnum } from '@repo/dto';
import { DashboardWidgetStat } from '@repo/ui/component/ui/dashboard-widget';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { searchLeaves } from '@/lib/action/leave.actions';

interface Props {
  employeeId?: number;
}

export function DashboardPendingLeave({ employeeId }: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    searchLeaves({
      pagination: { page: 1, limit: 1 },
      status: [LeaveStatusDtoEnum.pending],
      userId: employeeId ? [employeeId] : undefined,
    }).then((result) => setCount(result.totalRecords));
  }, [employeeId]);

  const href = employeeId ? '/emp/leave' : '/leaves/approvals';
  const label = employeeId ? 'My Pending Leaves' : 'Leave Approvals Pending';

  return <DashboardWidgetStat icon={Clock} label={label} value={count} valueColor='text-amber-600' href={href} />;
}

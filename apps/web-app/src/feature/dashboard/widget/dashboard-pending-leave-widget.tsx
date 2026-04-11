'use client';

import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getLeavePendingCount } from '@/lib/action/leave.actions';

interface Props {
  employeeId?: number;
}

export function DashboardPendingLeave({ employeeId }: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getLeavePendingCount(employeeId).then((result) => setCount(result.count));
  }, [employeeId]);

  const href = employeeId ? '/emp/leave' : '/leaves/approvals';
  const label = employeeId ? 'My Pending Leaves' : 'Leave Approvals Pending';

  return (
    <Widget label={label} icon={Clock} href={href}>
      <WidgetInnerSingleCounter value={count} valueColor='text-amber-600' />
    </Widget>
  );
}

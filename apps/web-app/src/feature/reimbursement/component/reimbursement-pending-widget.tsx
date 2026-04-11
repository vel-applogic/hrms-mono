'use client';

import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { ReceiptText } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getReimbursementPendingCount } from '@/lib/action/reimbursement.actions';

interface Props {
  employeeId?: number;
}

export function DashboardPendingReimbursement({ employeeId }: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getReimbursementPendingCount().then((result) => setCount(result.count));
  }, [employeeId]);

  const href = employeeId ? '/emp/reimbursement' : '/reimbursement';
  const label = employeeId ? 'My Pending Reimbursements' : 'Reimbursements Pending';

  return (
    <Widget label={label} icon={ReceiptText} href={href}>
      <WidgetInnerSingleCounter value={count} valueColor='text-amber-600' />
    </Widget>
  );
}

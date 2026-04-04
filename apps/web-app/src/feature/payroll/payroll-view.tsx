'use client';

import { PageTabs } from '@repo/ui/component/ui/page-tabs';

const TABS = [
  { id: 'compensation', label: 'Compensation', href: '/payroll/compensation' },
  { id: 'payslip', label: 'Payslip', href: '/payroll/payslip' },
];

interface Props {
  children: React.ReactNode;
}

export function PayrollView({ children }: Props) {
  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex min-h-0 flex-1 flex-col gap-4'>
        <PageTabs tabs={TABS} />
        <div className='min-h-0 flex-1 pb-4'>{children}</div>
      </div>
    </div>
  );
}

'use client';

import { PageTabs } from '@repo/ui/component/ui/page-tabs';

const TABS = [
  { id: 'payslip', label: 'Payslip', href: '/emp/payroll/payslip' },
  { id: 'compensation', label: 'Compensation', href: '/emp/payroll/compensation' },
  { id: 'deduction', label: 'Deduction', href: '/emp/payroll/deduction' },
];

interface Props {
  children: React.ReactNode;
}

export function EmpPayrollView({ children }: Props) {
  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex min-h-0 flex-1 flex-col gap-4'>
        <PageTabs tabs={TABS} />
        <div className='min-h-0 flex-1 pb-4'>{children}</div>
      </div>
    </div>
  );
}

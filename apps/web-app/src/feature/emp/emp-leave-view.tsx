'use client';

import { PageTabs } from '@repo/ui/component/ui/page-tabs';
import type { PageTab } from '@repo/ui/component/ui/page-tabs';

const TABS = [
  { id: 'leave', label: 'Leave', href: '/emp/leave' },
  { id: 'holiday', label: 'Holidays', href: '/emp/leave/holiday' },
];

const isActive = (tab: PageTab, pathname: string) => {
  if (tab.href === '/emp/leave') return pathname === '/emp/leave';
  return pathname.startsWith(tab.href);
};

interface Props {
  children: React.ReactNode;
}

export function EmpLeaveView({ children }: Props) {
  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <PageTabs tabs={TABS} isActive={isActive} />
        <div className='min-h-0 flex-1 pb-4'>{children}</div>
      </div>
    </div>
  );
}

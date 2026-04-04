'use client';

import type { PageTab } from '@repo/ui/component/ui/page-tabs';
import { PageTabs } from '@repo/ui/component/ui/page-tabs';
import { useSession } from 'next-auth/react';

const BASE_TABS: (PageTab & { adminOnly: boolean })[] = [
  { id: 'leaves', label: 'Leaves', href: '/leaves', adminOnly: false },
  { id: 'approvals', label: 'Awaiting Leave Approvals', href: '/leaves/approvals', adminOnly: true },
  { id: 'holiday', label: 'Holidays', href: '/leaves/holiday', adminOnly: false },
];

const isActive = (tab: PageTab, pathname: string) => {
  if (tab.href === '/leaves') {
    return pathname === '/leaves' || pathname.startsWith('/leaves/details') || pathname.startsWith('/leaves/counter');
  }
  return pathname.startsWith(tab.href);
};

interface Props {
  children: React.ReactNode;
}

export function LeaveView({ children }: Props) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isSuperAdmin || session?.user?.roles?.includes('admin');

  const tabs = BASE_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <PageTabs tabs={tabs} isActive={isActive} />
        <div className='min-h-0 flex-1 pb-4'>{children}</div>
      </div>
    </div>
  );
}

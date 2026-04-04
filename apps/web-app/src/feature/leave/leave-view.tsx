'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const BASE_TABS = [
  { id: 'leaves' as const, label: 'Leaves', href: '/leaves', adminOnly: false },
  { id: 'approvals' as const, label: 'Awaiting Leave Approvals', href: '/leaves/approvals', adminOnly: true },
  { id: 'holiday' as const, label: 'Holidays', href: '/leaves/holiday', adminOnly: false },
] as const;

interface Props {
  children: React.ReactNode;
}

export function LeaveView({ children }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.isSuperAdmin || session?.user?.roles?.includes('admin');

  const tabs = BASE_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  const isActive = (href: string) => {
    if (href === '/leaves') {
      return pathname === '/leaves' || pathname.startsWith('/leaves/details') || pathname.startsWith('/leaves/counter');
    }
    return pathname.startsWith(href);
  };

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <span className='text-xl font-medium tracking-tight text-foreground'>Leaves & Holidays</span>
      </div>

      <div className='flex min-h-0 flex-1 flex-col gap-4 pl-8 pr-8'>
        <div className='flex items-center gap-2.5 border-b border-border'>
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link key={tab.id} href={tab.href} className='group relative flex h-[52px] items-center px-3 pb-2 pt-3'>
                <span className={`text-sm font-bold tracking-widest transition-colors group-hover:text-foreground ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
                {active && <span className='absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary' />}
              </Link>
            );
          })}
        </div>

        <div className='min-h-0 flex-1 pb-4'>{children}</div>
      </div>
    </div>
  );
}

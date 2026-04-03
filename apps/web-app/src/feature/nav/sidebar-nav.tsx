'use client';

import { cn } from '@repo/ui/lib/utils';
import { Briefcase, Building2, CalendarDays, FileText, HandCoins, UserRound, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Organizations', href: '/organization', icon: Building2, superAdminOnly: true },
  { label: 'Users', href: '/user', icon: Users, superAdminOnly: false },
  { label: 'Policies', href: '/policy', icon: FileText, superAdminOnly: false },
  { label: 'Candidates', href: '/candidate', icon: UserRound, superAdminOnly: false },
  { label: 'Employees', href: '/employee', icon: Briefcase, superAdminOnly: false },
  { label: 'Payroll', href: '/payroll/compensation', icon: HandCoins, superAdminOnly: false },
  { label: 'Leaves & Holidays', href: '/leaves', icon: CalendarDays, superAdminOnly: false },
];

interface Props {
  isSuperAdmin?: boolean;
}

export function SidebarNav({ isSuperAdmin }: Props) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => !item.superAdminOnly || isSuperAdmin);

  return (
    <nav className='flex flex-1 flex-col gap-1 px-3 py-2'>
      {visibleItems.map((item) => {
        const baseSegment = '/' + item.href.split('/')[1];
        const isActive = pathname.startsWith(baseSegment);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className='h-5 w-5 shrink-0' />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

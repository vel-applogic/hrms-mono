'use client';

import { cn } from '@repo/ui/lib/utils';
import { Briefcase, Building2, CalendarDays, ClipboardList, FileText, HandCoins, LayoutDashboard, MessageSquare, ScrollText, UserRound, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  superAdminOnly: boolean;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, superAdminOnly: false },
  { label: 'Organizations', href: '/organization', icon: Building2, superAdminOnly: true },
  { label: 'Users', href: '/user', icon: Users, superAdminOnly: false },
  { label: 'Policies', href: '/policy', icon: FileText, superAdminOnly: false },
  { label: 'Candidates', href: '/candidate', icon: UserRound, superAdminOnly: false },
  { label: 'Employees', href: '/employee', icon: Briefcase, superAdminOnly: false },
  { label: 'Payroll', href: '/payroll/compensation', icon: HandCoins, superAdminOnly: false },
  { label: 'Leaves & Holidays', href: '/leaves', icon: CalendarDays, superAdminOnly: false },
];

const employeeNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/emp/dashboard', icon: LayoutDashboard, superAdminOnly: false },
  { label: 'My Details', href: '/emp/details', icon: UserRound, superAdminOnly: false },
  { label: 'Documents', href: '/emp/documents', icon: ScrollText, superAdminOnly: false },
  { label: 'Feedbacks', href: '/emp/feedbacks', icon: MessageSquare, superAdminOnly: false },
  { label: 'Payroll', href: '/emp/payroll', icon: HandCoins, superAdminOnly: false },
  { label: 'Leaves & Holidays', href: '/emp/leave', icon: CalendarDays, superAdminOnly: false },
  { label: 'Policies', href: '/emp/policy', icon: FileText, superAdminOnly: false },
];

interface Props {
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
}

export function SidebarNav({ isSuperAdmin, isAdmin }: Props) {
  const pathname = usePathname();

  const isAdminOrSuperAdmin = isSuperAdmin || isAdmin;
  const navItems = isAdminOrSuperAdmin ? adminNavItems : employeeNavItems;
  const visibleItems = navItems.filter((item) => !item.superAdminOnly || isSuperAdmin);

  return (
    <nav className='flex flex-1 flex-col gap-1 px-3 py-2'>
      {visibleItems.map((item) => {
        const isActive = item.href.startsWith('/emp/')
          ? pathname === item.href || pathname.startsWith(item.href + '/')
          : pathname.startsWith('/' + item.href.split('/')[1]);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-[--color-sidebar-active-bg] text-[--color-sidebar-active] font-semibold' : 'text-[--color-sidebar-foreground] hover:bg-[#e2e6ea] hover:text-foreground',
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

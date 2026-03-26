'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/component/ui/dropdown-menu';
import { LogOut, Menu, Settings, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

import { OrgSwitcher } from '@/feature/org/org-switcher';

const tabs = [
  { label: 'Organizations', href: '/organization', superAdminOnly: true },
  { label: 'Users', href: '/user', superAdminOnly: false },
  { label: 'Policies', href: '/policy', superAdminOnly: false },
  { label: 'Candidates', href: '/candidate', superAdminOnly: false },
  { label: 'Employees', href: '/employee', superAdminOnly: false },
  { label: 'Payroll', href: '/payroll/compensation', superAdminOnly: false },
  { label: 'Leaves', href: '/leaves/counter', superAdminOnly: false },
];

interface Props {
  userName: string;
  userEmail: string;
  isSuperAdmin?: boolean;
}

export function MobileNav({ userName, userEmail, isSuperAdmin }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border outline-none">
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="space-y-1.5 px-2 py-2">
          <p className="text-sm font-medium text-foreground">
            {userName}
            {userEmail && <span className="font-normal text-muted-foreground"> ({userEmail})</span>}
          </p>
          <OrgSwitcher />
        </div>
        <DropdownMenuSeparator className="bg-border" />
        {tabs.filter((tab) => !tab.superAdminOnly || isSuperAdmin).map((tab) => (
          <DropdownMenuItem key={tab.href} asChild className="cursor-pointer">
            <Link href={tab.href}>{tab.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile">
            <User />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut({ redirectTo: '/auth/login' })}
        >
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

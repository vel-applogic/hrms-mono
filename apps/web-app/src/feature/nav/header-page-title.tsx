'use client';

import { usePathname } from 'next/navigation';

const pageTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/organization': 'Organizations',
  '/user': 'Users',
  '/policy': 'Policies',
  '/candidate': 'Candidates',
  '/employee': 'Employees',
  '/payroll': 'Payroll',
  '/leaves': 'Leaves & Holidays',
  '/profile': 'Profile',
  '/emp/dashboard': 'Dashboard',
  '/emp/details': 'My Details',
  '/emp/documents': 'Documents',
  '/emp/feedbacks': 'Feedbacks',
  '/emp/payroll': 'Payroll',
  '/emp/leave': 'Leaves & Holidays',
  '/emp/policy': 'Policies',
  '/device': 'Devices',
  '/expense': 'Expenses',
  '/emp/device': 'My Devices',
};

export function HeaderPageTitle() {
  const pathname = usePathname();

  const title = pageTitleMap[pathname] ?? Object.entries(pageTitleMap).find(([prefix]) => pathname.startsWith(prefix + '/'))?.[1] ?? '';

  if (!title) return null;

  return <h1 className='text-lg font-semibold tracking-tight text-foreground'>{title}</h1>;
}

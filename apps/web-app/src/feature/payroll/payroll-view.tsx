'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { id: 'compensation' as const, label: 'Compensation', href: '/payroll/compensation' },
  { id: 'payslip' as const, label: 'Payslip', href: '/payroll/payslip' },
] as const;

interface Props {
  children: React.ReactNode;
}

export function PayrollView({ children }: Props) {
  const pathname = usePathname();

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <span className='text-xl font-medium tracking-tight text-foreground'>Payroll</span>
      </div>

      <div className='center-container flex min-h-0 flex-1 flex-col gap-4'>
        <div className='flex items-center gap-2.5 border-b border-border'>
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link key={tab.id} href={tab.href} className='group relative flex h-[52px] items-center px-3 pb-2 pt-3'>
                <span className={`text-sm font-bold tracking-widest transition-colors group-hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
                {isActive && <span className='absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary' />}
              </Link>
            );
          })}
        </div>

        <div className='min-h-0 flex-1 pb-4'>{children}</div>
      </div>
    </div>
  );
}

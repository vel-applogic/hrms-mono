import Link from 'next/link';

import { cn } from '../../lib/utils';

interface DashboardWidgetProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  colSpan?: 1 | 2;
}

export function DashboardWidget({ children, href, className, colSpan }: DashboardWidgetProps) {
  const baseClass = cn(
    'flex h-full items-center rounded-lg border border-border bg-card p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
    colSpan === 2 && 'lg:col-span-2',
    href && 'transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {children}
      </Link>
    );
  }

  return <div className={baseClass}>{children}</div>;
}

interface DashboardWidgetIconProps {
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardWidgetIcon({ icon: Icon }: DashboardWidgetIconProps) {
  return (
    <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
      <Icon className='h-7 w-7 text-primary' />
    </div>
  );
}

interface DashboardWidgetStatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string | null;
  valueColor?: string;
  href?: string;
}

export function DashboardWidgetStat({ icon, label, value, valueColor, href }: DashboardWidgetStatProps) {
  return (
    <DashboardWidget href={href}>
      <div className='flex w-full items-start gap-5'>
        <DashboardWidgetIcon icon={icon} />
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-muted-foreground'>{label}</span>
          {value === null ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <span className={cn('text-3xl font-semibold', valueColor)}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
          )}
        </div>
      </div>
    </DashboardWidget>
  );
}

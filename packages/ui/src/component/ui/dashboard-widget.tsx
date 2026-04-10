import Link from 'next/link';

import { cn } from '../../lib/utils';

interface DashboardWidgetProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  colSpan?: 1 | 2;
  compact?: boolean;
}

export function DashboardWidget({ children, href, className, colSpan, compact }: DashboardWidgetProps) {
  const baseClass = cn(
    'flex h-full items-center rounded-lg border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
    compact ? 'px-4 py-2.5' : 'px-7 py-4',
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
  compact?: boolean;
}

export function DashboardWidgetIcon({ icon: Icon, compact }: DashboardWidgetIconProps) {
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]', compact ? 'h-10 w-10' : 'h-14 w-14')}>
      <Icon className={cn('text-primary', compact ? 'h-5 w-5' : 'h-7 w-7')} />
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
      <div className='flex w-full flex-col gap-3'>
        <span className='text-sm font-semibold text-muted-foreground'>{label}</span>
        <div className='flex items-center gap-5'>
          <DashboardWidgetIcon icon={icon} />
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

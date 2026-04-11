import Link from 'next/link';

import { cn } from '../../lib/utils';

interface WidgetProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  link?: string;
  compact?: boolean;
  colSpan?: 1 | 2;
  href?: string;
  className?: string;
}

export function Widget({ label, icon, children, compact, colSpan, href, className }: WidgetProps) {
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
        <WidgetBody label={label} icon={icon} compact={compact} children={children} />
      </Link>
    );
  }

  return (
    <div className={baseClass}>
      <WidgetBody label={label} icon={icon} compact={compact} children={children} />
    </div>
  );
}

interface WidgetBodyProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  compact?: boolean;
}

function WidgetBody({ children, icon, label, compact }: WidgetBodyProps) {
  return (
    <div className='flex w-full flex-col gap-3'>
      <span className='text-sm font-semibold text-muted-foreground'>{label}</span>
      <div className='flex items-center gap-5'>
        {icon ? <WidgetIcon icon={icon} compact={compact} /> : null}
        {children}
      </div>
    </div>
  );
}

interface WidgetIconProps {
  icon: React.ComponentType<{ className?: string }>;
  compact?: boolean;
}

function WidgetIcon({ icon: Icon, compact }: WidgetIconProps) {
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]', compact ? 'h-10 min-w-10 w-auto' : 'h-14 min-w-14 w-auto')}>
      <Icon className={cn('text-primary', compact ? 'h-5 w-5' : 'h-7 w-7')} />
    </div>
  );
}

interface WidgetInnerSingleCounterProps {
  value: number | string | null;
  valueColor: string;
  caption?: string;
}

export function WidgetInnerSingleCounter({ value, valueColor, caption }: WidgetInnerSingleCounterProps) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-5'>
        {value === null ? <div className='h-9 w-16 animate-pulse rounded bg-muted' /> : <span className={cn('text-3xl font-semibold', valueColor)}>{value}</span>}
      </div>
      {caption && <span className='text-sm text-muted-foreground'>{caption}</span>}
    </div>
  );
}

interface WidgetInnerMultipleCounterProps {
  value: number | string | null;
  valueColor: string;
  label: string;
}

export function WidgetInnerMultipleCounter({ values }: { values: WidgetInnerMultipleCounterProps[] | null }) {
  return values === null ? (
    <div className='h-12 animate-pulse rounded bg-muted' />
  ) : (
    <div className='flex flex-wrap gap-4'>
      {values.map((value) => {
        return (
          <div key={value.label} className='flex flex-col'>
            <span className={`text-2xl font-semibold ${value.valueColor}`}>{value.value}</span>
            <span className='text-xs text-muted-foreground'>{value.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function WidgetInnerLabelValueList({ items, noRecordMessage }: { items: { label: string; value: string }[] | null; noRecordMessage?: string }) {
  return items === null ? (
    <div className='h-12 animate-pulse rounded bg-muted' />
  ) : (
    <div className='flex flex-col gap-2'>
      {items.map((item) => (
        <div key={item.label} className='flex items-center  gap-4'>
          <span className='w-auto min-w-[90px] shrink-0 text-sm font-medium'>{item.label}</span>
          <span className='text-xs text-muted-foreground'>{item.value}</span>
        </div>
      ))}
      {items.length === 0 && <p className='text-sm text-muted-foreground'>{noRecordMessage ?? 'No record found'}</p>}
    </div>
  );
}

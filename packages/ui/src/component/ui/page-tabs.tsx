'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../../lib/utils';

export interface PageTab {
  id: string;
  label: string;
  href: string;
}

interface Props {
  tabs: PageTab[];
  /** When provided, uses this value to match tab.id instead of pathname matching */
  activeTabId?: string;
  /** Custom active check per tab; overrides default pathname matching */
  isActive?: (tab: PageTab, pathname: string) => boolean;
}

export function PageTabs({ tabs, activeTabId, isActive: isActiveFn }: Props) {
  const pathname = usePathname();

  return (
    <div className='flex items-center gap-2.5 border-b border-border'>
      {tabs.map((tab) => {
        const active = activeTabId ? activeTabId === tab.id : isActiveFn ? isActiveFn(tab, pathname) : pathname.startsWith(tab.href);
        const Tag = activeTabId ? 'a' : Link;
        return (
          <Tag key={tab.id} href={tab.href} className='group relative flex h-[52px] items-center px-3 pb-2'>
            <span className={cn('text-sm font-bold tracking-widest transition-colors group-hover:text-foreground', active ? 'text-foreground' : 'text-muted-foreground')}>
              {tab.label}
            </span>
            {active && <span className='absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary' />}
          </Tag>
        );
      })}
    </div>
  );
}

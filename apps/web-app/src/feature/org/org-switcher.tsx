'use client';

import { cn } from '@repo/ui/lib/utils';
import { Building2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Props {
  variant?: 'default' | 'sidebar';
}

export function OrgSwitcher({ variant = 'default' }: Props) {
  const { data: session, update } = useSession();
  const organisations = session?.user?.organisations ?? [];
  const currentOrgId = session?.user?.organizationId;
  const currentOrg = organisations.find((o) => o.id === currentOrgId) ?? organisations[0];
  const router = useRouter();
  if (!currentOrg) return null;

  const hasMultiple = organisations.length > 1;
  const isSidebar = variant === 'sidebar';

  if (!hasMultiple) {
    return (
      <div className={cn('flex items-center gap-1.5 rounded px-2 py-1 opacity-60', isSidebar ? 'border border-white/20' : 'border border-border')}>
        <Building2 className={cn('h-3.5 w-3.5 shrink-0', isSidebar ? 'text-white/60' : 'text-muted-foreground')} />
        <span className={cn('max-w-[140px] truncate text-xs', isSidebar ? 'text-white' : 'text-foreground')}>{currentOrg.name}</span>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-0.5'>
      {organisations.map((org) => {
        const isActive = org.id === currentOrgId;
        return (
          <button
            key={org.id}
            type='button'
            className={cn(
              'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors',
              isSidebar
                ? isActive
                  ? 'bg-white/15 font-medium text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
                : isActive
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            onClick={() => {
              if (isActive) return;
              update({ organizationId: org.id }).then(() => {
                router.refresh();
              });
            }}
          >
            <Building2 className='h-3.5 w-3.5 shrink-0' />
            <span className='flex-1 truncate'>{org.name}</span>
            {isActive && <Check className={cn('h-3.5 w-3.5 shrink-0', isSidebar ? 'text-white' : 'text-primary')} />}
          </button>
        );
      })}
    </div>
  );
}

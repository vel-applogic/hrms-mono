'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/component/ui/dropdown-menu';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function OrgSwitcher() {
  const { data: session, update } = useSession();
  const organisations = session?.user?.organisations ?? [];
  const currentOrgId = session?.user?.organizationId;
  const currentOrg = organisations.find((o) => o.id === currentOrgId) ?? organisations[0];

  if (!currentOrg) return null;

  const hasMultiple = organisations.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!hasMultiple}>
        <button className="flex items-center gap-1.5 rounded border border-border px-2 py-1 outline-none transition-colors disabled:cursor-default disabled:opacity-60 enabled:hover:bg-accent">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="max-w-[140px] truncate text-xs text-foreground">{currentOrg.name}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {organisations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            className="cursor-pointer gap-2"
            onClick={() => update({ organizationId: org.id })}
          >
            <span className="flex-1 truncate">{org.name}</span>
            {org.id === currentOrgId && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/component/ui/dropdown-menu';
import { Building2, Check, LogOut, Settings, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

interface Props {
  userName: string;
  userEmail: string;
}

export function UserMenu({ userName, userEmail }: Props) {
  const { data: session, update } = useSession();
  const organisations = session?.user?.organisations ?? [];
  const currentOrgId = session?.user?.organizationId;
  const currentOrg = organisations.find((o) => o.id === currentOrgId) ?? organisations[0];
  const hasMultiple = organisations.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex cursor-pointer items-center gap-4 pr-4 outline-none">
          <div className="h-6 w-6 rounded-full bg-[#D9D9D9]" />
          <div className="flex flex-col items-start">
            <span className="text-sm text-white">
              {userName}
              {userEmail && <span className="text-muted-foreground"> ({userEmail})</span>}
            </span>
            {currentOrg && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {currentOrg.name}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
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
        {organisations.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Switch organisation</DropdownMenuLabel>
            {organisations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                disabled={!hasMultiple}
                className="gap-2"
                onClick={hasMultiple ? () => update({ organizationId: org.id }) : undefined}
              >
                <span className="flex-1 truncate">{org.name}</span>
                {org.id === currentOrgId && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
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

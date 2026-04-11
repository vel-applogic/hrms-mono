'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@repo/ui/component/ui/dropdown-menu';
import { Building2, Check, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import { NotificationPanel } from '@/feature/notification/container/notification-panel';

interface Props {
  userName: string;
  userEmail: string;
  userImageUrl?: string | null;
}

export function HeaderProfile({ userName, userEmail, userImageUrl }: Props) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const { data: session, update } = useSession();
  const organisations = session?.user?.organisations ?? [];
  const currentOrgId = session?.user?.organizationId;
  const currentOrg = organisations.find((o) => o.id === currentOrgId) ?? organisations[0];
  const hasMultiple = organisations.length > 1;
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const roles = session?.user?.roles ?? [];
  const canViewOrgSettings = isSuperAdmin || roles.includes('admin');
  const router = useRouter();

  return (
    <div className='flex items-center gap-3'>
      {/* Notification bell */}
      <NotificationPanel />

      {/* Profile dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left outline-none transition-colors hover:bg-accent'>
            <div className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-medium text-primary-foreground'>
              {userImageUrl ? <img src={userImageUrl} alt={userName} className='h-full w-full object-cover' /> : initials}
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-medium text-foreground'>{userName}</span>
              {currentOrg && <span className='text-xs text-muted-foreground'>{currentOrg.name}</span>}
            </div>
            <ChevronDown className='h-4 w-4 text-muted-foreground' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-52'>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium'>{userName}</p>
              <p className='text-xs text-muted-foreground'>{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-border' />
          <DropdownMenuItem asChild className='cursor-pointer'>
            <Link href='/profile/update'>
              <User />
              Profile
            </Link>
          </DropdownMenuItem>
          {canViewOrgSettings && (
            <DropdownMenuItem asChild className='cursor-pointer'>
              <Link href='/organization/settings'>
                <Settings />
                Organization Settings
              </Link>
            </DropdownMenuItem>
          )}
          {organisations.length > 0 && (
            <>
              <DropdownMenuSeparator className='bg-border' />
              <DropdownMenuLabel className='text-xs text-muted-foreground'>Switch organisation</DropdownMenuLabel>
              {organisations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  disabled={!hasMultiple}
                  className='gap-2'
                  onClick={hasMultiple ? () => update({ organizationId: org.id }).then(() => router.refresh()) : undefined}
                >
                  <span className='flex-1 truncate'>{org.name}</span>
                  {org.id === currentOrgId && <Check className='h-3.5 w-3.5 shrink-0 text-primary' />}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator className='bg-border' />
          <DropdownMenuItem className='cursor-pointer text-destructive focus:text-destructive' onClick={() => signOut({ redirectTo: '/auth/login' })}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

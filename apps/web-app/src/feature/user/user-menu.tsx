'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/component/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface Props {
  userName: string;
}

export function UserMenu({ userName }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex cursor-pointer items-center gap-4 pr-4 outline-none">
          <div className="h-6 w-6 rounded-full bg-[#D9D9D9]" />
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-white">{userName}</span>
            <div className="h-1 w-1 rounded-full bg-online" />
            <span className="text-sm text-secondary-foreground">Super admin</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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

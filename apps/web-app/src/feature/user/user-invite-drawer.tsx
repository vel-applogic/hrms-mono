'use client';

import { AdminUserCreateRequestType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@repo/ui/component/ui/sheet';
import React, { useEffect, useState } from 'react';

import { createUser } from '@/lib/action/user.actions';

interface UserInviteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserInviteDrawer({ open, onOpenChange, onSuccess }: UserInviteDrawerProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setEmail('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data: AdminUserCreateRequestType = { email };
      await createUser(data);
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col gap-0 p-0 sm:max-w-md'>
        <SheetHeader className='px-6 py-5 border-b border-border'>
          <SheetTitle>Invite User</SheetTitle>
          <SheetDescription>Send an invitation email. The user will be invited as an admin and can set their name and password via the invite link.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-5 px-6 py-5 flex-1'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='invite-email'>Email address</Label>
              <Input
                id='invite-email'
                type='email'
                placeholder='user@example.com'
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>
          <SheetFooter className='px-6 py-4 border-t border-border'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

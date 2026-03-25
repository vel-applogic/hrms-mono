'use client';

import { AdminUserListResponseType, AdminUserUpdateRequestType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@repo/ui/component/ui/sheet';
import { Switch } from '@repo/ui/component/ui/switch';
import React, { useEffect, useState } from 'react';

import { updateUser } from '@/lib/action/user.actions';

interface UserEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserListResponseType | null;
  onSuccess: () => void;
}

export function UserEditDrawer({ open, onOpenChange, user, onSuccess }: UserEditDrawerProps) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && open) {
      setFirstname(user.firstname ?? '');
      setLastname(user.lastname ?? '');
      setIsActive(user.isActive);
      setError('');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data: AdminUserUpdateRequestType = { firstname, lastname, isActive };
      await updateUser(user.id, data);
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
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>Update user details.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-5 px-6 py-5 flex-1'>
            <div className='flex flex-col gap-1.5'>
              <Label className='text-muted-foreground text-xs'>Email</Label>
              <p className='text-sm text-white'>{user?.email}</p>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='edit-firstname'>First name</Label>
                <Input
                  id='edit-firstname'
                  value={firstname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)}
                  placeholder='John'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='edit-lastname'>Last name</Label>
                <Input
                  id='edit-lastname'
                  value={lastname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
                  placeholder='Doe'
                />
              </div>
            </div>
            <div className='flex items-center justify-between rounded-lg border border-border px-4 py-3'>
              <div className='flex flex-col gap-0.5'>
                <Label htmlFor='edit-active' className='cursor-pointer'>Active</Label>
                <span className='text-xs text-muted-foreground'>User can log in when active</span>
              </div>
              <Switch id='edit-active' checked={isActive} onCheckedChange={setIsActive} />
            </div>
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>
          <SheetFooter className='px-6 py-4 border-t border-border'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

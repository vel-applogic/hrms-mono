'use client';

import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import type { AdminUserListResponseType } from '@repo/dto';
import { useState } from 'react';

import { blockUser, unblockUser } from '@/lib/action/user.actions';

interface UserBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserListResponseType | null;
  onSuccess: () => void;
}

export function UserBlockDialog({ open, onOpenChange, user, onSuccess }: UserBlockDialogProps) {
  const [loading, setLoading] = useState(false);
  const isBlocking = user?.isActive ?? true;

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (isBlocking) {
        await blockUser(user.id);
      } else {
        await unblockUser(user.id);
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error(`Failed to ${isBlocking ? 'block' : 'unblock'} user`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBlocking ? 'Block User' : 'Unblock User'}</DialogTitle>
          <DialogDescription>
            {isBlocking ? (
              <>
                Are you sure you want to block <strong>{user?.firstname} {user?.lastname}</strong> ({user?.email})? They will no longer be able to access the platform.
              </>
            ) : (
              <>
                Are you sure you want to unblock <strong>{user?.firstname} {user?.lastname}</strong> ({user?.email})? They will regain access to the platform.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant={isBlocking ? 'destructive' : 'default'} onClick={handleConfirm} disabled={loading}>
            {loading ? (isBlocking ? 'Blocking...' : 'Unblocking...') : isBlocking ? 'Block' : 'Unblock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

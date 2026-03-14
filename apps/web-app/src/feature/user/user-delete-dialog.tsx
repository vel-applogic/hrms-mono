'use client';

import type { AdminUserListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { userService } from '@/lib/service/user.service';

interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserListResponseType | null;
  onSuccess: () => void;
}

export function UserDeleteDialog({ open, onOpenChange, user, onSuccess }: UserDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await userService.remove(user.id);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to delete user', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user?.firstname} {user?.lastname} ({user?.email})? This will deactivate the user.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

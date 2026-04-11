'use client';

import { BranchResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteBranch } from '@/lib/action/branch.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: BranchResponseType | null;
  onSuccess: () => void;
}

export function BranchDeleteDialog({ open, onOpenChange, branch, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!branch) return;
    setLoading(true);
    try {
      await deleteBranch(branch.id);
      onOpenChange(false);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete branch</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{branch?.name}</strong>? This action cannot be undone.
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

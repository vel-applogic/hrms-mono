'use client';

import { PolicyListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deletePolicy } from '@/lib/action/policy.actions';

interface PolicyDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: PolicyListResponseType | null;
  onSuccess: () => void;
}

export function PolicyDeleteDialog({ open, onOpenChange, policy, onSuccess }: PolicyDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!policy) return;
    setLoading(true);
    setError('');
    try {
      await deletePolicy(policy.id);
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete policy</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>You are deleting this policy. This action cannot be recovered.</p>

        {error && <p className='text-sm text-destructive'>{error}</p>}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Confirm delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

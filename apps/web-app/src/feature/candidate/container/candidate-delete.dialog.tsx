'use client';

import { CandidateListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteCandidate } from '@/lib/action/candidate.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: CandidateListResponseType | null;
  onSuccess: () => void;
}

export function CandidateDeleteDialog({ open, onOpenChange, candidate, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!candidate) return;
    setLoading(true);
    setError('');
    try {
      await deleteCandidate(candidate.id);
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
          <DialogTitle>Delete candidate</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>
          Are you sure you want to delete candidate{' '}
          <span className='font-medium text-white'>
            {candidate?.firstname} {candidate?.lastname}
          </span>
          ? This action cannot be undone.
        </p>

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

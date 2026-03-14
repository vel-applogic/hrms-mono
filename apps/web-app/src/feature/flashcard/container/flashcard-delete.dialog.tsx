'use client';

import { FlashcardListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteFlashcard } from '@/lib/action/flashcard.actions';

interface FlashcardDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcard: FlashcardListResponseType | null;
  onSuccess: () => void;
}

export function FlashcardDeleteDialog({ open, onOpenChange, flashcard, onSuccess }: FlashcardDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!flashcard) return;
    setLoading(true);
    setError('');
    try {
      await deleteFlashcard(flashcard.id);
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
          <DialogTitle>Delete flashcard</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>
          You are deleting this flashcard. This action cannot be recovered.
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

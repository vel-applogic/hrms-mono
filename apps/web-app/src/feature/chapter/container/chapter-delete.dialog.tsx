'use client';

import { ChapterListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteChapter } from '@/lib/action/chapter.actions';

interface ChapterDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: ChapterListResponseType | null;
  onSuccess: () => void;
}

export function ChapterDeleteDialog({ open, onOpenChange, chapter, onSuccess }: ChapterDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!chapter) return;
    setLoading(true);
    setError('');
    try {
      await deleteChapter(chapter.id);
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
          <DialogTitle>Delete chapter</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>
          You are deleting chapter <span className='font-medium text-white'>{chapter?.title}</span>, which will delete its all topics, slides, quiz, etc., which can not be recovered.
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

'use client';

import { SlideListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteSlide } from '@/lib/action/slide.actions';

interface SlideDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: SlideListResponseType | null;
  onSuccess: () => void;
}

export function SlideDeleteDialog({ open, onOpenChange, slide, onSuccess }: SlideDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!slide) return;
    setLoading(true);
    setError('');
    try {
      await deleteSlide(slide.id, slide.chapterId, slide.topicId);
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
          <DialogTitle>Delete slide</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>
          You are deleting this slide. This action cannot be recovered.
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

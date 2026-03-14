'use client';

import { QuestionListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteQuestion } from '@/lib/action/question.actions';

interface QuestionDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuestionListResponseType | null;
  onSuccess: () => void;
}

export function QuestionDeleteDialog({ open, onOpenChange, question, onSuccess }: QuestionDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!question) return;
    setLoading(true);
    setError('');
    try {
      await deleteQuestion(question.id);
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
          <DialogTitle>Delete question</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>
          You are deleting question <span className='font-medium text-white'>&quot;{question?.question}&quot;</span>. This action cannot be recovered.
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

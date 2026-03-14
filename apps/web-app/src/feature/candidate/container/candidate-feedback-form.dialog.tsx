'use client';

import type { CandidateFeedbackResponseType } from '@repo/dto';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/shadcn/dialog';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Textarea } from '@repo/ui/component/ui/textarea';
import { useEffect, useState } from 'react';

import { createCandidateFeedback, updateCandidateFeedback } from '@/lib/action/candidate-feedback.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: number;
  feedback?: CandidateFeedbackResponseType;
  onSuccess: (feedback: CandidateFeedbackResponseType) => void;
}

export function CandidateFeedbackFormDialog({ open, onOpenChange, candidateId, feedback, onSuccess }: Props) {
  const isEditing = !!feedback;
  const [text, setText] = useState(feedback?.feedback ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setText(feedback?.feedback ?? '');
      setError('');
    }
  }, [open, feedback?.feedback]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Feedback is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        const result = await updateCandidateFeedback(feedback!.id, { feedback: trimmed }, feedback!.candidateId);
        onSuccess(result);
      } else {
        const result = await createCandidateFeedback({ candidateId, feedback: trimmed });
        onSuccess(result);
      }
      setText('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setText(feedback?.feedback ?? '');
      setError('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit feedback' : 'Add feedback'}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='feedback'>Feedback</Label>
            <Textarea id='feedback' value={text} onChange={(e) => setText(e.target.value)} placeholder='Enter feedback...' rows={4} className='resize-none' />
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

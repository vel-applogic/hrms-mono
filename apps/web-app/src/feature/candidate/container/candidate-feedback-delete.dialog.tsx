'use client';

import type { CandidateFeedbackResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/component/shadcn/dialog';
import { useState } from 'react';

import { deleteCandidateFeedback } from '@/lib/action/candidate-feedback.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: CandidateFeedbackResponseType | null;
  onSuccess: () => void;
}

export function CandidateFeedbackDeleteDialog({ open, onOpenChange, feedback, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!feedback) return;
    setLoading(true);
    try {
      await deleteCandidateFeedback(feedback.id, feedback.candidateId);
      onSuccess();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete feedback</DialogTitle>
          <DialogDescription>Are you sure you want to delete this feedback? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
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

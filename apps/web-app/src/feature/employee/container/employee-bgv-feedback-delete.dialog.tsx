'use client';

import type { EmployeeBgvFeedbackResponseType } from '@repo/dto';
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

import { deleteEmployeeBgvFeedback } from '@/lib/action/employee-bgv-feedback.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: EmployeeBgvFeedbackResponseType | null;
  onSuccess: () => void;
}

export function EmployeeBgvFeedbackDeleteDialog({ open, onOpenChange, feedback, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!feedback) return;
    setLoading(true);
    try {
      await deleteEmployeeBgvFeedback(feedback.id, feedback.employeeId);
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
          <DialogTitle>Delete BGV feedback</DialogTitle>
          <DialogDescription>Are you sure you want to delete this BGV feedback? This action cannot be undone.</DialogDescription>
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

'use client';

import type { EmployeeCompensationResponseType } from '@repo/dto';
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

import { deleteEmployeeCompensation } from '@/lib/action/employee-compensation.actions';

function formatAmount(value: number) {
  return `₹${value.toLocaleString()}`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compensation: EmployeeCompensationResponseType | null;
  employeeId: number;
  onSuccess: () => void;
}

export function EmployeeCompensationDeleteDialog({ open, onOpenChange, compensation, employeeId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!compensation) return;
    setLoading(true);
    try {
      await deleteEmployeeCompensation(compensation.id, employeeId);
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
          <DialogTitle>Delete compensation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this compensation entry? This will permanently remove the record (Gross:{' '}
            {compensation ? formatAmount(compensation.gross) : ''}, Effective from: {compensation?.effectiveFrom ?? ''}).
            This action cannot be undone.
          </DialogDescription>
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

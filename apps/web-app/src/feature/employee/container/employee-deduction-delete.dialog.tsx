'use client';

import type { EmployeeDeductionResponseType } from '@repo/dto';
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

import { deleteEmployeeDeduction } from '@/lib/action/employee-deduction.actions';

const DEDUCTION_TYPE_LABELS: Record<string, string> = {
  providentFund: 'Provident Fund',
  incomeTax: 'Income Tax',
  insurance: 'Insurance',
  professionalTax: 'Professional Tax',
  loan: 'Loan',
  other: 'Other',
};

function formatAmount(value: number) {
  return `₹${value.toLocaleString()}`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deduction: EmployeeDeductionResponseType | null;
  employeeId: number;
  onSuccess: () => void;
}

export function EmployeeDeductionDeleteDialog({ open, onOpenChange, deduction, employeeId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deduction) return;
    setLoading(true);
    try {
      await deleteEmployeeDeduction(deduction.id, employeeId);
      onSuccess();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = deduction ? DEDUCTION_TYPE_LABELS[deduction.type] ?? deduction.type : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete deduction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this deduction? ({typeLabel}: {deduction ? formatAmount(deduction.amount) : ''}, Effective from:{' '}
            {deduction?.effectiveFrom ?? ''}). This action cannot be undone.
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

'use client';

import { DepartmentResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteDepartment } from '@/lib/action/department.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: DepartmentResponseType | null;
  onSuccess: () => void;
}

export function DepartmentDeleteDialog({ open, onOpenChange, department, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!department) return;
    setLoading(true);
    try {
      await deleteDepartment(department.id);
      onOpenChange(false);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete department</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{department?.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
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

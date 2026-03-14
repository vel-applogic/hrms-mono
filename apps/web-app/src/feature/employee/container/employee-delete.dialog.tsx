'use client';

import { EmployeeListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteEmployee } from '@/lib/action/employee.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeListResponseType | null;
  onSuccess: () => void;
}

export function EmployeeDeleteDialog({ open, onOpenChange, employee, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!employee) return;
    setLoading(true);
    setError('');
    try {
      await deleteEmployee(employee.id);
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
          <DialogTitle>Delete employee</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>
          Are you sure you want to delete employee{' '}
          <span className='font-medium text-white'>
            {employee?.firstname} {employee?.lastname}
          </span>
          ? This action cannot be undone.
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

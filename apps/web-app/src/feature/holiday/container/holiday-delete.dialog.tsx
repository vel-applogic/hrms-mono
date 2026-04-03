'use client';

import type { HolidayResponseType } from '@repo/dto';
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

import { deleteHoliday } from '@/lib/action/holiday.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: HolidayResponseType | null;
  onSuccess: () => void;
}

export function HolidayDeleteDialog({ open, onOpenChange, holiday, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!holiday) return;
    setLoading(true);
    try {
      await deleteHoliday(holiday.id);
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
          <DialogTitle>Delete holiday</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{holiday?.name}&quot; ({holiday?.date})? This action cannot be undone.
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

'use client';

import { ThemeListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteTheme } from '@/lib/action/theme.actions';

interface ThemeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ThemeListResponseType | null;
  onSuccess: () => void;
}

export function ThemeDeleteDialog({ open, onOpenChange, theme, onSuccess }: ThemeDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!theme) return;
    setLoading(true);
    setError('');
    try {
      await deleteTheme(theme.id);
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
          <DialogTitle>Delete theme</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>
          You are deleting theme <span className='font-medium text-white'>{theme?.title}</span>. This action cannot be undone.
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

'use client';

import { OrganizationResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { useState } from 'react';

import { deleteOrganization } from '@/lib/action/organization.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: OrganizationResponseType | null;
  onSuccess: () => void;
}

export function OrganizationDeleteDialog({ open, onOpenChange, organization, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!organization) return;
    setLoading(true);
    setError('');
    try {
      const result = await deleteOrganization(organization.id);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
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
          <DialogTitle>Delete organization</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>
          Are you sure you want to delete organization{' '}
          <span className='font-medium text-foreground'>{organization?.name}</span>? This action cannot be undone.
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

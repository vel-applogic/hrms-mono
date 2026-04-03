'use client';

import type { OrganizationDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getOrganizationById } from '@/lib/action/organization.actions';

import { OrganizationUpsertDrawer } from './container/organization-upsert.drawer';

interface Props {
  organizationId: number;
}

export function OrganizationViewInfo({ organizationId }: Props) {
  const router = useRouter();
  const [organization, setOrganization] = useState<OrganizationDetailResponseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const fetchOrganization = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOrganizationById(organizationId);
      if (result.ok) {
        setOrganization(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void fetchOrganization();
  }, [fetchOrganization]);

  const handleEditSuccess = () => {
    setEditDrawerOpen(false);
    void fetchOrganization();
    router.refresh();
  };

  if (loading || !organization) {
    return <p className='text-sm text-muted-foreground'>Loading...</p>;
  }

  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Organization Info</h2>
        <Button size='sm' onClick={() => setEditDrawerOpen(true)}>
          <Pencil className='h-4 w-4' />
          Edit
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Name</Label>
          <p className='text-sm font-medium'>{organization.name}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Logo</Label>
          {organization.logo ? (
            <img src={organization.logo.urlFull} alt='Logo' className='h-16 w-16 rounded-md border border-border object-contain' />
          ) : (
            <p className='text-sm text-muted-foreground'>No logo uploaded</p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Created at</Label>
          <p className='text-sm font-medium'>{new Date(organization.createdAt).toLocaleDateString()}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Updated at</Label>
          <p className='text-sm font-medium'>{new Date(organization.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <OrganizationUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} organization={organization} onSuccess={handleEditSuccess} />
    </>
  );
}

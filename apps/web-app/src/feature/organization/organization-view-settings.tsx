'use client';

import type { OrganizationDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getOrganizationById } from '@/lib/action/organization.actions';

import { OrganizationUpsertDrawer } from './container/organization-upsert.drawer';

const NO_OF_DAYS_LABELS: Record<string, string> = {
  dynamic: 'Dynamic',
  thirty: '30 Days',
  thirtyOne: '31 Days',
};

interface Props {
  organizationId: number;
}

export function OrganizationViewSettings({ organizationId }: Props) {
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

  const settings = organization.settings;

  if (!settings) {
    return (
      <>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-lg font-medium'>Settings</h2>
          <Button size='sm' onClick={() => setEditDrawerOpen(true)}>
            <Pencil className='h-4 w-4' />
            Configure
          </Button>
        </div>
        <p className='text-sm text-muted-foreground'>No settings configured yet.</p>
        <OrganizationUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} organization={organization} onSuccess={handleEditSuccess} />
      </>
    );
  }

  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Settings</h2>
        <Button size='sm' onClick={() => setEditDrawerOpen(true)}>
          <Pencil className='h-4 w-4' />
          Edit
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>No. of days in month</Label>
          <p className='text-sm font-medium'>{NO_OF_DAYS_LABELS[settings.noOfDaysInMonth] ?? settings.noOfDaysInMonth}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Total leave days</Label>
          <p className='text-sm font-medium'>{settings.totalLeaveInDays}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Sick leave days</Label>
          <p className='text-sm font-medium'>{settings.sickLeaveInDays}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Earned leave days</Label>
          <p className='text-sm font-medium'>{settings.earnedLeaveInDays}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Casual leave days</Label>
          <p className='text-sm font-medium'>{settings.casualLeaveInDays}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Maternity leave days</Label>
          <p className='text-sm font-medium'>{settings.maternityLeaveInDays}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Paternity leave days</Label>
          <p className='text-sm font-medium'>{settings.paternityLeaveInDays}</p>
        </div>
      </div>

      <OrganizationUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} organization={organization} onSuccess={handleEditSuccess} />
    </>
  );
}

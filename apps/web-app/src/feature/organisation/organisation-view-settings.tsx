'use client';

import type { OrganisationDetailResponseType } from '@repo/dto';
import { getFinancialYearCode } from '@repo/shared';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getOrganisationById } from '@/lib/action/organisation.actions';

import { OrganisationUpsertDrawer } from './container/organisation-upsert.drawer';

const NO_OF_DAYS_LABELS: Record<string, string> = {
  dynamic: 'Dynamic',
  thirty: '30 Days',
  thirtyOne: '31 Days',
};

const WEEK_DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  organisationId: number;
}

export function OrganisationViewSettings({ organisationId }: Props) {
  const router = useRouter();
  const [organisation, setOrganisation] = useState<OrganisationDetailResponseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const fetchOrganisation = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOrganisationById(organisationId);
      if (result.ok) {
        setOrganisation(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    void fetchOrganisation();
  }, [fetchOrganisation]);

  const handleEditSuccess = () => {
    setEditDrawerOpen(false);
    void fetchOrganisation();
    router.refresh();
  };

  if (loading || !organisation) {
    return <p className='text-sm text-muted-foreground'>Loading...</p>;
  }

  const settings = organisation.settings;

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
        <OrganisationUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} organisation={organisation} onSuccess={handleEditSuccess} />
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

      <section className='flex flex-col gap-4'>
        <h3 className='text-base font-semibold'>Leave settings</h3>
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
      </section>

      <section className='mt-6 flex flex-col gap-4'>
        <h3 className='text-base font-semibold'>Weekoff days</h3>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Days</Label>
          <p className='text-sm font-medium'>
            {settings.weeklyOffDays.length > 0
              ? settings.weeklyOffDays
                  .slice()
                  .sort((a, b) => a - b)
                  .map((d) => WEEK_DAY_LABELS[d])
                  .join(', ')
              : '—'}
          </p>
        </div>
      </section>

      <section className='mt-6 flex flex-col gap-4'>
        <h3 className='text-base font-semibold'>Financial year</h3>
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>Starts in</Label>
            <p className='text-sm font-medium'>{MONTH_LABELS[settings.financialYearStartsAt - 1] ?? '—'}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground'>Current financial year</Label>
            <p className='text-sm font-medium'>{getFinancialYearCode(new Date(), settings.financialYearStartsAt)}</p>
          </div>
        </div>
      </section>

      <OrganisationUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} organisation={organisation} onSuccess={handleEditSuccess} />
    </>
  );
}

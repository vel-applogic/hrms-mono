'use client';

import type { OrganizationDetailResponseType } from '@repo/dto';
import { contactTypeDtoEnumToReadableLabel } from '@repo/shared';
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

      {/* Address */}
      <div className='mt-8'>
        <h3 className='mb-4 text-base font-medium'>Address</h3>
        {organization.address ? (
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='flex flex-col gap-1'>
              <Label className='text-muted-foreground'>Address line 1</Label>
              <p className='text-sm font-medium'>{organization.address.addressLine1}</p>
            </div>
            {organization.address.addressLine2 && (
              <div className='flex flex-col gap-1'>
                <Label className='text-muted-foreground'>Address line 2</Label>
                <p className='text-sm font-medium'>{organization.address.addressLine2}</p>
              </div>
            )}
            <div className='flex flex-col gap-1'>
              <Label className='text-muted-foreground'>City</Label>
              <p className='text-sm font-medium'>{organization.address.city}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-muted-foreground'>State</Label>
              <p className='text-sm font-medium'>{organization.address.state}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-muted-foreground'>Postal code</Label>
              <p className='text-sm font-medium'>{organization.address.postalCode}</p>
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-muted-foreground'>Country</Label>
              <p className='text-sm font-medium'>{organization.address.country.name}</p>
            </div>
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>No address configured</p>
        )}
      </div>

      {/* Contacts */}
      <div className='mt-8'>
        <h3 className='mb-4 text-base font-medium'>Contacts</h3>
        {organization.contacts && organization.contacts.length > 0 ? (
          <div className='flex flex-col gap-3'>
            {organization.contacts.map((contact) => (
              <div key={contact.id} className='flex items-center gap-4 rounded-md border border-border px-4 py-3'>
                <span className='min-w-[100px] text-sm text-muted-foreground'>{contactTypeDtoEnumToReadableLabel(contact.contactType)}</span>
                <span className='text-sm font-medium'>{contact.contact}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>No contacts configured</p>
        )}
      </div>

      <OrganizationUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} organization={organization} onSuccess={handleEditSuccess} />
    </>
  );
}

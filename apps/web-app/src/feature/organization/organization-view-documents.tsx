'use client';

import type { OrganizationDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { FileText, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getOrganizationById } from '@/lib/action/organization.actions';

import { OrganizationUpsertDrawer } from './container/organization-upsert.drawer';

interface Props {
  organizationId: number;
}

export function OrganizationViewDocuments({ organizationId }: Props) {
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

  const documents = organization.documents;

  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Documents</h2>
        <Button size='sm' onClick={() => setEditDrawerOpen(true)}>
          <Pencil className='h-4 w-4' />
          Edit
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        <Label className='text-muted-foreground'>Uploaded documents</Label>
        <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3'>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.document.urlFull}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50'
              >
                <FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span className='truncate text-primary hover:underline'>{doc.document.name}</span>
              </a>
            ))
          ) : (
            <p className='col-span-full rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground'>No documents uploaded</p>
          )}
        </div>
      </div>

      <OrganizationUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} organization={organization} onSuccess={handleEditSuccess} />
    </>
  );
}

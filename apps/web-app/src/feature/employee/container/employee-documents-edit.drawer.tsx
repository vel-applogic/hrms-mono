'use client';

import type { EmployeeDetailResponseType, EmployeeUpdateDocumentsRequestType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';

import { FileUpload } from '@/container/s3-file-upload/s3-file-upload';
import { updateEmployeeDocuments } from '@/lib/action/employee.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeDetailResponseType;
  onSuccess: () => void;
}

function toUpsertMedia(doc: { id: number; key: string; name: string; type: string }) {
  return { key: doc.key, name: doc.name, type: doc.type as 'image' | 'file', id: doc.id };
}

export function EmployeeDocumentsEditDrawer({ open, onOpenChange, employee, onSuccess }: Props) {
  const [photo, setPhoto] = useState<{ key: string; name: string; type: string; id?: number } | undefined>();
  const [documents, setDocuments] = useState<Array<{ key: string; name: string; type: string; id?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPhoto(employee.photo ? toUpsertMedia(employee.photo) : undefined);
      setDocuments((employee.documents ?? []).map(toUpsertMedia));
      setError('');
    }
  }, [open, employee.photo, employee.documents]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: EmployeeUpdateDocumentsRequestType = {
        photo: photo ? { key: photo.key, name: photo.name, type: photo.type as 'image' | 'file', id: photo.id } : undefined,
        documents: documents.map((m) => ({ key: m.key, name: m.name, type: m.type as 'image' | 'file', id: m.id })),
      };
      await updateEmployeeDocuments(employee.id, payload);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPhoto(employee.photo ? toUpsertMedia(employee.photo) : undefined);
      setDocuments((employee.documents ?? []).map(toUpsertMedia));
      setError('');
    }
    onOpenChange(next);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      title='Add/Edit Documents'
      footer={
        <div className='flex items-center gap-3'>
          {error && <p className='mr-auto text-sm text-destructive'>{error}</p>}
          <Button type='button' variant='outline' onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className='flex flex-col gap-6 p-6'>
        <div className='flex flex-col gap-2'>
          <Label>Photo</Label>
          <FileUpload
            isMultiple={false}
            media={photo ? [photo] : []}
            onUploaded={(val) => setPhoto(val)}
            onRemove={() => setPhoto(undefined)}
            onError={(err) => err && setError(err)}
            variant='dark'
            previewFirst
          />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Documents</Label>
          <FileUpload
            isMultiple={true}
            media={documents}
            onUploaded={(val) => setDocuments((prev) => [...prev, val])}
            onRemove={(index) => setDocuments((prev) => prev.filter((_, i) => i !== index))}
            onError={(err) => err && setError(err)}
            variant='dark'
            previewFirst
          />
        </div>
      </div>
    </Drawer>
  );
}

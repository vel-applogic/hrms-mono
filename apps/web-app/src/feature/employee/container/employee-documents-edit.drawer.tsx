'use client';

import type { EmployeeDetailResponseType, EmployeeUpdateDocumentsRequestType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
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
  return { key: doc.key, name: doc.name, type: doc.type as MediaTypeDtoEnum, id: doc.id };
}

export function EmployeeDocumentsEditDrawer({ open, onOpenChange, employee, onSuccess }: Props) {
  const [resume, setResume] = useState<{ key: string; name: string; type: MediaTypeDtoEnum; id?: number } | undefined>();
  const [offerLetters, setOfferLetters] = useState<Array<{ key: string; name: string; type: MediaTypeDtoEnum; id?: number }>>([]);
  const [otherDocuments, setOtherDocuments] = useState<Array<{ key: string; name: string; type: MediaTypeDtoEnum; id?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setResume(employee.resume ? toUpsertMedia(employee.resume) : undefined);
      setOfferLetters((employee.offerLetters ?? []).map(toUpsertMedia));
      setOtherDocuments((employee.otherDocuments ?? []).map(toUpsertMedia));
      setError('');
    }
  }, [open, employee.resume, employee.offerLetters, employee.otherDocuments]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: EmployeeUpdateDocumentsRequestType = {
        resume: resume ? { key: resume.key, name: resume.name, type: resume.type, id: resume.id } : undefined,
        offerLetters: offerLetters.map((m) => ({ key: m.key, name: m.name, type: m.type, id: m.id })),
        otherDocuments: otherDocuments.map((m) => ({ key: m.key, name: m.name, type: m.type, id: m.id })),
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
      setResume(employee.resume ? toUpsertMedia(employee.resume) : undefined);
      setOfferLetters((employee.offerLetters ?? []).map(toUpsertMedia));
      setOtherDocuments((employee.otherDocuments ?? []).map(toUpsertMedia));
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
          <Label>Resume</Label>
          <FileUpload
            isMultiple={false}
            media={resume ? [resume] : []}
            onUploaded={(val) => setResume(val)}
            onRemove={() => setResume(undefined)}
            onError={(err) => err && setError(err)}

            previewFirst
          />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Offer letters</Label>
          <FileUpload
            isMultiple={true}
            media={offerLetters}
            onUploaded={(val) => setOfferLetters((prev) => [...prev, val])}
            onRemove={(index) => setOfferLetters((prev) => prev.filter((_, i) => i !== index))}
            onError={(err) => err && setError(err)}

            previewFirst
          />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Other documents</Label>
          <FileUpload
            isMultiple={true}
            media={otherDocuments}
            onUploaded={(val) => setOtherDocuments((prev) => [...prev, val])}
            onRemove={(index) => setOtherDocuments((prev) => prev.filter((_, i) => i !== index))}
            onError={(err) => err && setError(err)}

            previewFirst
          />
        </div>
      </div>
    </Drawer>
  );
}

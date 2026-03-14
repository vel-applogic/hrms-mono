'use client';

import type { CandidateDetailResponseType, CandidateUpdateDocumentsRequestType } from '@repo/dto';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { useEffect, useState } from 'react';

import { FileUpload } from '@/container/s3-file-upload/s3-file-upload';
import { updateCandidateDocuments } from '@/lib/action/candidate.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: CandidateDetailResponseType;
  onSuccess: () => void;
}

function toUpsertMedia(doc: { id: number; key: string; name: string; type: string }) {
  return { id: doc.id, key: doc.key, name: doc.name, type: doc.type as 'image' | 'file' };
}

export function CandidateDocumentsEditDrawer({ open, onOpenChange, candidate, onSuccess }: Props) {
  const [resume, setResume] = useState<{ key: string; name: string; type: string; id?: number } | undefined>();
  const [offerLetters, setOfferLetters] = useState<Array<{ key: string; name: string; type: string; id?: number }>>([]);
  const [otherDocuments, setOtherDocuments] = useState<Array<{ key: string; name: string; type: string; id?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setResume(candidate.resume ? toUpsertMedia(candidate.resume) : undefined);
      setOfferLetters((candidate.offerLetters ?? []).map(toUpsertMedia));
      setOtherDocuments((candidate.otherDocuments ?? []).map(toUpsertMedia));
      setError('');
    }
  }, [open, candidate.resume, candidate.offerLetters, candidate.otherDocuments]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: CandidateUpdateDocumentsRequestType = {
        resume: resume ? { key: resume.key, name: resume.name, type: resume.type as 'image' | 'file', id: resume.id } : undefined,
        offerLetters: offerLetters.map((m) => ({ key: m.key, name: m.name, type: m.type as 'image' | 'file', id: m.id })),
        otherDocuments: otherDocuments.map((m) => ({ key: m.key, name: m.name, type: m.type as 'image' | 'file', id: m.id })),
      };
      await updateCandidateDocuments(candidate.id, payload);
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
      setResume(candidate.resume ? toUpsertMedia(candidate.resume) : undefined);
      setOfferLetters((candidate.offerLetters ?? []).map(toUpsertMedia));
      setOtherDocuments((candidate.otherDocuments ?? []).map(toUpsertMedia));
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
            variant='dark'
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
            variant='dark'
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
            variant='dark'
            previewFirst
          />
        </div>
      </div>
    </Drawer>
  );
}

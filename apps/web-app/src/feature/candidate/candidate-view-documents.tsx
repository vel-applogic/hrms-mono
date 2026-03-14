'use client';

import type { CandidateDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { FileText, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CandidateDocumentsEditDialog } from './container/candidate-documents-edit.dialog';

interface Props {
  candidate: CandidateDetailResponseType;
}

function DocumentItem({ doc }: { doc: { id: number; name: string; urlFull: string } }) {
  return (
    <a
      href={doc.urlFull}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50'
    >
      <FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
      <span className='truncate text-primary hover:underline'>{doc.name}</span>
    </a>
  );
}

function DocumentSection({ label, items, emptyText }: { label: string; items: Array<{ id: number; name: string; urlFull: string }>; emptyText: string }) {
  return (
    <div className='flex flex-col gap-2'>
      <Label className='text-muted-foreground'>{label}</Label>
      <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3'>
        {items.length > 0 ? (
          items.map((doc) => <DocumentItem key={doc.id} doc={doc} />)
        ) : (
          <p className='col-span-full rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground'>{emptyText}</p>
        )}
      </div>
    </div>
  );
}

export function CandidateViewDocuments({ candidate }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const handleSuccess = () => {
    setEditOpen(false);
    router.refresh();
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Documents</h2>
        <Button size='sm' onClick={() => setEditOpen(true)}>
          <Plus className='h-4 w-4' />
          Add/Edit Documents
        </Button>
      </div>

      <div className='flex flex-col gap-6'>
        <DocumentSection
          label='Resume'
          items={candidate.resume ? [{ id: candidate.resume.id, name: candidate.resume.name, urlFull: candidate.resume.urlFull }] : []}
          emptyText='No resume'
        />
        <DocumentSection
          label='Offer letters'
          items={(candidate.offerLetters ?? []).map((d) => ({ id: d.id, name: d.name, urlFull: d.urlFull }))}
          emptyText='No offer letters'
        />
        <DocumentSection
          label='Other documents'
          items={(candidate.otherDocuments ?? []).map((d) => ({ id: d.id, name: d.name, urlFull: d.urlFull }))}
          emptyText='No other documents'
        />
      </div>

      <CandidateDocumentsEditDialog open={editOpen} onOpenChange={setEditOpen} candidate={candidate} onSuccess={handleSuccess} />
    </div>
  );
}

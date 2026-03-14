'use client';

import type { CandidateDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getCandidateById } from '@/lib/action/candidate.actions';

import { CandidateUpsertDrawer } from './container/candidate-upsert.drawer';

interface Props {
  candidateId: number;
}

export function CandidateViewBasicDetails({ candidateId }: Props) {
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateDetailResponseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const fetchCandidate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCandidateById(candidateId);
      setCandidate(data);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    void fetchCandidate();
  }, [fetchCandidate]);

  const handleEditSuccess = () => {
    setEditDrawerOpen(false);
    void fetchCandidate();
    router.refresh();
  };

  if (loading || !candidate) {
    return <p className='text-sm text-muted-foreground'>Loading...</p>;
  }

  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Basic Details</h2>
        <Button size='sm' onClick={() => setEditDrawerOpen(true)}>
          <Pencil className='h-4 w-4' />
          Edit
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>First name</Label>
          <p className='text-sm font-medium'>{candidate.firstname}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Last name</Label>
          <p className='text-sm font-medium'>{candidate.lastname}</p>
        </div>
        <div className='flex flex-col gap-2 md:col-span-2'>
          <Label className='text-muted-foreground'>Email</Label>
          <p className='text-sm font-medium'>{candidate.email}</p>
        </div>
        <div className='flex flex-col gap-2 md:col-span-2'>
          <Label className='text-muted-foreground'>Contact numbers</Label>
          <p className='text-sm font-medium'>{candidate.contactNumbers?.length ? candidate.contactNumbers.join(', ') : '—'}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Source</Label>
          <p className='text-sm font-medium'>{candidate.source}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Status</Label>
          <p className='text-sm font-medium'>{candidate.status}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Progress</Label>
          <p className='text-sm font-medium'>{candidate.progress}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Experience (years)</Label>
          <p className='text-sm font-medium'>{candidate.expInYears}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Relevant experience (years)</Label>
          <p className='text-sm font-medium'>{candidate.relevantExpInYears}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Current CTC (lacs)</Label>
          <p className='text-sm font-medium'>{candidate.currentCtcInLacs}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Expected CTC (lacs)</Label>
          <p className='text-sm font-medium'>{candidate.expectedCtcInLacs}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Label className='text-muted-foreground'>Notice period</Label>
          <p className='text-sm font-medium'>
            {candidate.noticePeriod} {candidate.noticePeriodUnit}
          </p>
        </div>
        <div className='flex flex-col gap-2 md:col-span-2'>
          <Label className='text-muted-foreground'>Skills</Label>
          <p className='text-sm font-medium'>{candidate.skills?.length ? candidate.skills.join(', ') : '—'}</p>
        </div>
        <div className='flex flex-col gap-2 md:col-span-2'>
          <Label className='text-muted-foreground'>URLs</Label>
          <p className='text-sm font-medium'>{candidate.urls?.length ? candidate.urls.join(', ') : '—'}</p>
        </div>
      </div>

      <CandidateUpsertDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} candidate={candidate} onSuccess={handleEditSuccess} />
    </>
  );
}

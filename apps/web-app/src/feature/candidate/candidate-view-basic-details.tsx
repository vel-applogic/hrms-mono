'use client';

import type { CandidateDetailResponseType } from '@repo/dto';
import { Label } from '@repo/ui/component/ui/label';

interface Props {
  candidate: CandidateDetailResponseType;
}

export function CandidateViewBasicDetails({ candidate }: Props) {
  return (
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
  );
}

'use client';

import type { CandidateDetailResponseType, CandidateFeedbackResponseType, PaginatedResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { CandidateViewBasicDetails } from './candidate-view-basic-details';
import { CandidateViewDocuments } from './candidate-view-documents';
import { CandidateViewFeedbacks } from './candidate-view-feedbacks';

const TABS = [
  { id: 'basic' as const, label: 'Basic Details' },
  { id: 'documents' as const, label: 'Documents' },
  { id: 'feedbacks' as const, label: 'Feedbacks' },
] as const;

interface Props {
  candidate: CandidateDetailResponseType;
  initialFeedbackPage: PaginatedResponseType<CandidateFeedbackResponseType>;
  activeTab: 'basic' | 'documents' | 'feedbacks';
}

export function CandidateView({ candidate, initialFeedbackPage, activeTab }: Props) {
  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/candidate'>
            <Button variant='ghost' size='icon' className='shrink-0'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-xl font-medium tracking-tight text-foreground'>
              {candidate.firstname} {candidate.lastname}
            </h1>
            <p className='text-sm text-muted-foreground'>{candidate.email}</p>
          </div>
        </div>
      </div>

      <div className='center-container flex flex-col gap-4'>
        <div className='flex items-center gap-2.5 border-b border-border'>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link key={tab.id} href={`/candidate/${candidate.id}/${tab.id}`} className='group relative flex h-[52px] items-center px-3 pb-2 pt-3'>
                <span className={`text-sm font-bold tracking-widest transition-colors group-hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
                {isActive && <span className='absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary' />}
              </Link>
            );
          })}
        </div>

        <div className='min-h-0 flex-1 p-6'>
          {activeTab === 'basic' && <CandidateViewBasicDetails candidateId={candidate.id} />}
          {activeTab === 'documents' && <CandidateViewDocuments candidateId={candidate.id} />}
          {activeTab === 'feedbacks' && <CandidateViewFeedbacks candidateId={candidate.id} initialPage={initialFeedbackPage} />}
        </div>
      </div>
    </div>
  );
}

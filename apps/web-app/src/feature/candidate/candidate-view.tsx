'use client';

import type { CandidateDetailResponseType, CandidateFeedbackResponseType, PaginatedResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PageTabs } from '@repo/ui/component/ui/page-tabs';
import Link from 'next/link';

import { CandidateViewBasicDetails } from './candidate-view-basic-details';
import { CandidateViewDocuments } from './candidate-view-documents';
import { CandidateViewFeedbacks } from './candidate-view-feedbacks';

interface Props {
  candidate: CandidateDetailResponseType;
  initialFeedbackPage: PaginatedResponseType<CandidateFeedbackResponseType>;
  activeTab: 'basic' | 'documents' | 'feedbacks';
}

export function CandidateView({ candidate, initialFeedbackPage, activeTab }: Props) {
  const tabs = [
    { id: 'basic', label: 'Basic Details', href: `/candidate/${candidate.id}/basic` },
    { id: 'documents', label: 'Documents', href: `/candidate/${candidate.id}/documents` },
    { id: 'feedbacks', label: 'Feedbacks', href: `/candidate/${candidate.id}/feedbacks` },
  ];

  return (
    <div className='flex h-full flex-col gap-4'>
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
        <PageTabs tabs={tabs} activeTabId={activeTab} />

        <div className='min-h-0 flex-1 p-6'>
          {activeTab === 'basic' && <CandidateViewBasicDetails candidateId={candidate.id} />}
          {activeTab === 'documents' && <CandidateViewDocuments candidateId={candidate.id} />}
          {activeTab === 'feedbacks' && <CandidateViewFeedbacks candidateId={candidate.id} initialPage={initialFeedbackPage} />}
        </div>
      </div>
    </div>
  );
}

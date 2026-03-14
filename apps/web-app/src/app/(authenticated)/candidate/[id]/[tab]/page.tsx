import { notFound } from 'next/navigation';

import { CandidateView } from '@/feature/candidate/candidate-view';
import { getCandidateById } from '@/lib/action/candidate.actions';
import { searchCandidateFeedbacks } from '@/lib/action/candidate-feedback.actions';

const TABS = ['basic', 'documents', 'feedbacks'] as const;
type Tab = (typeof TABS)[number];

function isTab(tab: string): tab is Tab {
  return TABS.includes(tab as Tab);
}

interface Props {
  params: Promise<{ id: string; tab: string }>;
}

export default async function CandidateViewPage(props: Props) {
  const { id, tab } = await props.params;
  const candidateId = parseInt(id, 10);
  if (isNaN(candidateId) || !isTab(tab)) {
    notFound();
  }

  const [candidate, feedbackPage] = await Promise.all([
    getCandidateById(candidateId),
    searchCandidateFeedbacks({ candidateId, pagination: { page: 1, limit: 10 } }),
  ]).catch(() => [null, null]);

  if (!candidate) {
    notFound();
  }

  return (
    <div className='flex h-full flex-col'>
      <CandidateView
        candidate={candidate}
        initialFeedbackPage={feedbackPage ?? { results: [], totalRecords: 0, page: 1, limit: 10 }}
        activeTab={tab}
      />
    </div>
  );
}

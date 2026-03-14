'use client';

import type { CandidateFeedbackResponseType, PaginatedResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { createCandidateFeedback, deleteCandidateFeedback, searchCandidateFeedbacks, updateCandidateFeedback } from '@/lib/action/candidate-feedback.actions';

import { CandidateFeedbackDeleteDialog } from './container/candidate-feedback-delete.dialog';
import { CandidateFeedbackFormDialog } from './container/candidate-feedback-form.dialog';

const PAGE_SIZE = 10;

function formatTimelineDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleDateString(undefined, { month: 'short' });
  const year = d.getFullYear() !== now.getFullYear() ? `, ${d.getFullYear()}` : '';
  return `${day} ${month}${year}`;
}

interface Props {
  candidateId: number;
  initialPage: PaginatedResponseType<CandidateFeedbackResponseType>;
}

export function CandidateViewFeedbacks({ candidateId, initialPage }: Props) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<CandidateFeedbackResponseType[]>(initialPage.results);
  const [page, setPage] = useState(initialPage.page);
  const [totalRecords, setTotalRecords] = useState(initialPage.totalRecords);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<CandidateFeedbackResponseType | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<CandidateFeedbackResponseType | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = feedbacks.length < totalRecords;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await searchCandidateFeedbacks({
        candidateId,
        pagination: { page: page + 1, limit: PAGE_SIZE },
      });
      setFeedbacks((prev) => [...prev, ...next.results]);
      setPage(next.page);
      setTotalRecords(next.totalRecords);
    } finally {
      setLoadingMore(false);
    }
  }, [candidateId, hasMore, loadingMore, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loadingMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: '100px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const handleAddSuccess = (newFeedback: CandidateFeedbackResponseType) => {
    setFeedbacks((prev) => [newFeedback, ...prev]);
    setTotalRecords((prev) => prev + 1);
    setAddDialogOpen(false);
    router.refresh();
  };

  const handleEditSuccess = (updated: CandidateFeedbackResponseType) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setEditingFeedback(null);
    router.refresh();
  };

  const handleDeleteSuccess = () => {
    if (deletingFeedback) {
      setFeedbacks((prev) => prev.filter((f) => f.id !== deletingFeedback.id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
      setDeletingFeedback(null);
    }
    router.refresh();
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6'>
        <h2 className='text-lg font-medium'>Feedbacks</h2>
      </div>

      <div className='relative flex-1 overflow-y-auto'>
        <div className='relative pl-1'>
          <div className='absolute left-[6.84rem] top-0 bottom-0 w-px bg-primary' />
          <div className='flex flex-col'>
            {/* Add new row at top of timeline */}
            <div className='flex gap-4 pb-6'>
              <p className='w-20 shrink-0 pt-0.5 text-right text-xs text-muted-foreground'>Now</p>
              <div className='flex w-5 shrink-0 items-start justify-center pt-0.5'>
                <div className='z-10 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary bg-background' />
              </div>
              <div className='flex min-w-0 flex-1 items-center justify-start pt-0.5'>
                <Button size='sm' onClick={() => setAddDialogOpen(true)}>
                  <Plus className='h-4 w-4' />
                  Add new
                </Button>
              </div>
            </div>
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className='flex gap-4 pb-6'>
                <p className='w-20 shrink-0 pt-0.5 text-right text-xs text-muted-foreground'>{formatTimelineDate(feedback.createdAt)}</p>
                <div className='flex w-5 shrink-0 items-start justify-center pt-0.5'>
                  <div className='z-10 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary bg-background' />
                </div>
                <div className='min-w-0 flex-1 pt-0.5'>
                  <div className='flex w-fit flex-col gap-0.5'>
                    <p className='whitespace-pre-wrap text-sm font-semibold'>{feedback.feedback}</p>
                    <p className='text-xs text-muted-foreground'>
                      by {feedback.givenBy.firstname} {feedback.givenBy.lastname}
                    </p>
                    <div className='flex items-center gap-0.5'>
                      <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => setEditingFeedback(feedback)}>
                        <Pencil className='h-3 w-3' />
                      </Button>
                      <Button variant='ghost' size='icon' className='h-6 w-6 text-destructive hover:text-destructive' onClick={() => setDeletingFeedback(feedback)}>
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {feedbacks.length === 0 && <p className='py-4 text-sm text-muted-foreground'>No feedbacks yet.</p>}
        {hasMore && (
          <div ref={sentinelRef} className='flex justify-center py-4'>
            {loadingMore && <span className='text-sm text-muted-foreground'>Loading...</span>}
          </div>
        )}
      </div>

      <CandidateFeedbackFormDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} candidateId={candidateId} onSuccess={handleAddSuccess} />
      <CandidateFeedbackFormDialog
        open={!!editingFeedback}
        onOpenChange={(open) => !open && setEditingFeedback(null)}
        candidateId={candidateId}
        feedback={editingFeedback ?? undefined}
        onSuccess={handleEditSuccess}
      />
      <CandidateFeedbackDeleteDialog
        open={!!deletingFeedback}
        onOpenChange={(open) => !open && setDeletingFeedback(null)}
        feedback={deletingFeedback}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

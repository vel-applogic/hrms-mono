'use client';

import type { EmployeeFeedbackResponseType, PaginatedResponseType } from '@repo/dto';
import { EmployeeFeedbackTrendDtoEnum } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createEmployeeFeedback, deleteEmployeeFeedback, searchEmployeeFeedbacks, updateEmployeeFeedback } from '@/lib/action/employee-feedback.actions';

import { EmployeeFeedbackDeleteDialog } from './container/employee-feedback-delete.dialog';
import { EmployeeFeedbackFormDialog } from './container/employee-feedback-form.dialog';

const PAGE_SIZE = 10;

function formatTimelineDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  const isSameDate = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (isSameDate) return time;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleDateString(undefined, { month: 'short' });
  const year = d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : '';
  return `${time}, ${day} ${month}${year}`;
}

interface Props {
  employeeId: number;
  initialPage: PaginatedResponseType<EmployeeFeedbackResponseType>;
}

export function EmployeeViewFeedbacks({ employeeId, initialPage }: Props) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<EmployeeFeedbackResponseType[]>(initialPage.results);
  const [page, setPage] = useState(initialPage.page);
  const [totalRecords, setTotalRecords] = useState(initialPage.totalRecords);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<EmployeeFeedbackResponseType | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<EmployeeFeedbackResponseType | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = feedbacks.length < totalRecords;

  const stats = useMemo(() => {
    const totalPoints = feedbacks.reduce((sum, f) => sum + (f.point ?? 0), 0);
    const positive = feedbacks.filter((f) => f.trend === EmployeeFeedbackTrendDtoEnum.positive).length;
    const neutral = feedbacks.filter((f) => f.trend === EmployeeFeedbackTrendDtoEnum.neutral).length;
    const negative = feedbacks.filter((f) => f.trend === EmployeeFeedbackTrendDtoEnum.negative).length;
    return { totalPoints, positive, neutral, negative };
  }, [feedbacks]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await searchEmployeeFeedbacks({
        employeeId,
        pagination: { page: page + 1, limit: PAGE_SIZE },
      });
      setFeedbacks((prev) => [...prev, ...next.results]);
      setPage(next.page);
      setTotalRecords(next.totalRecords);
    } finally {
      setLoadingMore(false);
    }
  }, [employeeId, hasMore, loadingMore, page]);

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

  const handleAddSuccess = (newFeedback: EmployeeFeedbackResponseType) => {
    setFeedbacks((prev) => [newFeedback, ...prev]);
    setTotalRecords((prev) => prev + 1);
    setAddDialogOpen(false);
    router.refresh();
  };

  const handleEditSuccess = (updated: EmployeeFeedbackResponseType) => {
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

      <div className='mb-6 flex flex-wrap gap-4'>
        <div className='w-[200px] shrink-0 rounded-md border border-border bg-muted/30 p-4'>
          <Label className='text-muted-foreground'>Total points</Label>
          <p className='mt-1 text-lg font-medium'>{stats.totalPoints}</p>
        </div>
        <div className='w-[200px] shrink-0 rounded-md border border-border bg-muted/30 p-4'>
          <Label className='text-muted-foreground'>Positive</Label>
          <p className='mt-1 text-lg font-medium text-green-500'>{stats.positive}</p>
        </div>
        <div className='w-[200px] shrink-0 rounded-md border border-border bg-muted/30 p-4'>
          <Label className='text-muted-foreground'>Neutral</Label>
          <p className='mt-1 text-lg font-medium text-muted-foreground'>{stats.neutral}</p>
        </div>
        <div className='w-[200px] shrink-0 rounded-md border border-border bg-muted/30 p-4'>
          <Label className='text-muted-foreground'>Negative</Label>
          <p className='mt-1 text-lg font-medium text-red-500'>{stats.negative}</p>
        </div>
      </div>

      <div className='relative flex-1 overflow-y-auto'>
        <div className='relative pl-1'>
          <div className='absolute left-[7.82rem] top-0 bottom-0 w-px bg-primary' />
          <div className='flex flex-col'>
            <div className='flex gap-4 pb-6'>
              <p className='w-24 shrink-0 pt-0.5 text-right text-xs text-muted-foreground'>Now</p>
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
                <p className='w-24 shrink-0 pt-0.5 text-right text-xs text-muted-foreground'>{formatTimelineDate(feedback.createdAt)}</p>
                <div className='flex w-5 shrink-0 items-start justify-center pt-0.5'>
                  <div className='z-10 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary bg-background' />
                </div>
                <div className='min-w-0 flex-1 pt-0.5'>
                  <div className='flex w-fit flex-col gap-0.5'>
                    <p className='text-sm font-semibold'>{feedback.title}</p>
                    <p className='whitespace-pre-wrap text-sm'>{feedback.feedback}</p>
                    <p className='text-xs text-muted-foreground'>
                      {feedback.trend}
                      {feedback.point != null && ` • ${feedback.point} pts`}
                      {' • '}by {feedback.givenBy.firstname} {feedback.givenBy.lastname}
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

      <EmployeeFeedbackFormDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} employeeId={employeeId} onSuccess={handleAddSuccess} />
      <EmployeeFeedbackFormDialog
        open={!!editingFeedback}
        onOpenChange={(open) => !open && setEditingFeedback(null)}
        employeeId={employeeId}
        feedback={editingFeedback ?? undefined}
        onSuccess={handleEditSuccess}
      />
      <EmployeeFeedbackDeleteDialog
        open={!!deletingFeedback}
        onOpenChange={(open) => !open && setDeletingFeedback(null)}
        feedback={deletingFeedback}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

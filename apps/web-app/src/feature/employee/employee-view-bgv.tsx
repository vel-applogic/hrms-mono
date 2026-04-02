'use client';

import type { EmployeeBgvFeedbackResponseType, PaginatedResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { searchEmployeeBgvFeedbacks } from '@/lib/action/employee-bgv-feedback.actions';

import { EmployeeBgvFeedbackDeleteDialog } from './container/employee-bgv-feedback-delete.dialog';
import { EmployeeBgvFeedbackFormDialog } from './container/employee-bgv-feedback-form.dialog';

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
  initialPage: PaginatedResponseType<EmployeeBgvFeedbackResponseType>;
}

export function EmployeeViewBgv({ employeeId, initialPage }: Props) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<EmployeeBgvFeedbackResponseType[]>(initialPage.results);
  const [page, setPage] = useState(initialPage.page);
  const [totalRecords, setTotalRecords] = useState(initialPage.totalRecords);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<EmployeeBgvFeedbackResponseType | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<EmployeeBgvFeedbackResponseType | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = feedbacks.length < totalRecords;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await searchEmployeeBgvFeedbacks({
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

  const handleAddSuccess = (newFeedback: EmployeeBgvFeedbackResponseType) => {
    setFeedbacks((prev) => [newFeedback, ...prev]);
    setTotalRecords((prev) => prev + 1);
    setAddDialogOpen(false);
    router.refresh();
  };

  const handleEditSuccess = (updated: EmployeeBgvFeedbackResponseType) => {
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
        <h2 className='text-lg font-medium'>BGV (Background Verification)</h2>
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
                    <p className='whitespace-pre-wrap text-sm'>{feedback.feedback}</p>
                    {feedback.files && feedback.files.length > 0 && (
                      <div className='mt-1 flex flex-wrap gap-2'>
                        {feedback.files.map((file) => (
                          <a
                            key={file.id}
                            href={file.urlFull}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground'
                          >
                            <FileText className='h-3 w-3' />
                            {file.name}
                          </a>
                        ))}
                      </div>
                    )}
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
        {feedbacks.length === 0 && <p className='py-4 text-sm text-muted-foreground'>No BGV feedbacks yet.</p>}
        {hasMore && (
          <div ref={sentinelRef} className='flex justify-center py-4'>
            {loadingMore && <span className='text-sm text-muted-foreground'>Loading...</span>}
          </div>
        )}
      </div>

      <EmployeeBgvFeedbackFormDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} employeeId={employeeId} onSuccess={handleAddSuccess} />
      <EmployeeBgvFeedbackFormDialog
        open={!!editingFeedback}
        onOpenChange={(open) => !open && setEditingFeedback(null)}
        employeeId={employeeId}
        feedback={editingFeedback ?? undefined}
        onSuccess={handleEditSuccess}
      />
      <EmployeeBgvFeedbackDeleteDialog
        open={!!deletingFeedback}
        onOpenChange={(open) => !open && setDeletingFeedback(null)}
        feedback={deletingFeedback}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

'use client';

import type { EmployeeCompensationResponseType, PaginatedResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { cn } from '@repo/ui/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { searchEmployeeCompensations } from '@/lib/action/employee-compensation.actions';

import { EmployeeCompensationDeleteDialog } from './container/employee-compensation-delete.dialog';
import { EmployeeCompensationFormDrawer } from './container/employee-compensation-form.drawer';

const PAGE_SIZE = 10;

function formatAmount(value: number) {
  return `₹${value.toLocaleString()}`;
}

function CompensationCard({
  compensation,
  onEdit,
  onDelete,
  readOnly,
}: {
  compensation: EmployeeCompensationResponseType;
  onEdit: (compensation: EmployeeCompensationResponseType) => void;
  onDelete: (compensation: EmployeeCompensationResponseType) => void;
  readOnly?: boolean;
}) {
  return (
    <div className={cn('relative rounded-md border border-border p-4', compensation.isActive ? 'bg-white dark:bg-white/5' : 'bg-muted/30')}>
      <div className='absolute right-1 top-1 flex items-center gap-1.5'>
        {!readOnly && <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => onEdit(compensation)}>
          <Pencil className='h-3.5 w-3.5' />
        </Button>}
        {!readOnly && <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive hover:text-destructive' onClick={() => onDelete(compensation)}>
          <Trash2 className='h-3.5 w-3.5' />
        </Button>}
        {compensation.isActive ? (
          <span className='rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400'>Active</span>
        ) : (
          <span className='rounded-md border border-muted-foreground/30 bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground'>Inactive</span>
        )}
      </div>
      <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5'>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Gross</Label>
          <p className='text-lg font-medium'>{formatAmount(compensation.grossAmount)}</p>
        </div>
        {compensation.lineItems.map((li) => (
          <div key={li.id} className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>{li.title}</Label>
            <p className='text-lg font-medium'>{formatAmount(li.amount)}</p>
          </div>
        ))}
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Effective from</Label>
          <p className='text-lg font-medium'>{compensation.effectiveFrom}</p>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Effective till</Label>
          <p className='text-lg font-medium'>{compensation.effectiveTill ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}

export function EmployeeViewCompensation({ employeeId, initialPage, readOnly }: Props) {
  const router = useRouter();
  const [compensations, setCompensations] = useState<EmployeeCompensationResponseType[]>(initialPage.results);
  const [page, setPage] = useState(initialPage.page);
  const [totalRecords, setTotalRecords] = useState(initialPage.totalRecords);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingCompensation, setEditingCompensation] = useState<EmployeeCompensationResponseType | null>(null);
  const [deletingCompensation, setDeletingCompensation] = useState<EmployeeCompensationResponseType | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = compensations.length < totalRecords;

  const sortedCompensations = useMemo(() => {
    return [...compensations].sort((a, b) => (b.effectiveFrom || '').localeCompare(a.effectiveFrom || ''));
  }, [compensations]);

  const recentCompensation = sortedCompensations[0] ?? null;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await searchEmployeeCompensations({
        employeeId,
        pagination: { page: page + 1, limit: PAGE_SIZE },
      });
      setCompensations((prev) => [...prev, ...next.results]);
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

  const handleAddSuccess = useCallback(
    async (_newCompensation: EmployeeCompensationResponseType) => {
      setAddDialogOpen(false);
      try {
        const fresh = await searchEmployeeCompensations({
          employeeId,
          pagination: { page: 1, limit: Math.max(PAGE_SIZE, totalRecords + 10) },
        });
        setCompensations(fresh.results);
        setPage(fresh.page);
        setTotalRecords(fresh.totalRecords);
      } catch {
        router.refresh();
      }
    },
    [employeeId, totalRecords],
  );

  const handleEditSuccess = (updated: EmployeeCompensationResponseType) => {
    setCompensations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCompensation(null);
    router.refresh();
  };

  const handleDeleteSuccess = () => {
    if (deletingCompensation) {
      setCompensations((prev) => prev.filter((c) => c.id !== deletingCompensation.id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
      setDeletingCompensation(null);
    }
    router.refresh();
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Compensation</h2>
        {!readOnly && (
          <Button size='sm' onClick={() => setAddDialogOpen(true)}>
            <Plus className='h-4 w-4' />
            Add compensation
          </Button>
        )}
      </div>

      {sortedCompensations.length > 0 ? (
        <>
          <CompensationCard
            compensation={sortedCompensations[0]!}
            onEdit={(comp) => setEditingCompensation(comp)}
            onDelete={(comp) => setDeletingCompensation(comp)}
            readOnly={readOnly}
          />
          {sortedCompensations.length > 1 && (
            <div className='mt-6 flex flex-col gap-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Compensation history</h3>
              {sortedCompensations.slice(1).map((c) => (
                <CompensationCard
                  key={c.id}
                  compensation={c}
                  onEdit={(comp) => setEditingCompensation(comp)}
                  onDelete={(comp) => setDeletingCompensation(comp)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className='py-4 text-sm text-muted-foreground'>No compensation records yet.</p>
      )}

      {hasMore && (
        <div ref={sentinelRef} className='flex justify-center py-4'>
          {loadingMore && <span className='text-sm text-muted-foreground'>Loading...</span>}
        </div>
      )}

      <EmployeeCompensationFormDrawer open={addDialogOpen} onOpenChange={setAddDialogOpen} employeeId={employeeId} lastCompensation={recentCompensation ?? undefined} onSuccess={handleAddSuccess} />
      <EmployeeCompensationFormDrawer
        open={!!editingCompensation}
        onOpenChange={(open) => !open && setEditingCompensation(null)}
        employeeId={employeeId}
        compensation={editingCompensation ?? undefined}
        onSuccess={handleEditSuccess}
      />
      <EmployeeCompensationDeleteDialog
        open={!!deletingCompensation}
        onOpenChange={(open) => !open && setDeletingCompensation(null)}
        compensation={deletingCompensation}
        employeeId={employeeId}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

interface Props {
  employeeId: number;
  initialPage: PaginatedResponseType<EmployeeCompensationResponseType>;
  readOnly?: boolean;
}

'use client';

import type { EmployeeDeductionResponseType, PaginatedResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { cn } from '@repo/ui/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { searchEmployeeDeductions } from '@/lib/action/employee-deduction.actions';

import { EmployeeDeductionDeleteDialog } from './container/employee-deduction-delete.dialog';
import { EmployeeDeductionFormDrawer } from './container/employee-deduction-form.drawer';

const PAGE_SIZE = 10;

const DEDUCTION_TYPE_LABELS: Record<string, string> = {
  providentFund: 'Provident Fund',
  incomeTax: 'Income Tax',
  insurance: 'Insurance',
  professionalTax: 'Professional Tax',
  loan: 'Loan',
  lop: 'LOP',
  other: 'Other',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthYear(value: string | undefined): string {
  if (!value) return '—';
  const parts = value.split('-');
  const month = parseInt(parts[1] ?? '0', 10);
  const year = parts[0];
  if (month >= 1 && month <= 12 && year) return `${MONTH_NAMES[month - 1]} ${year}`;
  return value;
}

function formatAmount(value: number) {
  return `₹${value.toLocaleString()}`;
}

function DeductionCard({
  deduction,
  onEdit,
  onDelete,
  readOnly,
}: {
  deduction: EmployeeDeductionResponseType;
  onEdit: (deduction: EmployeeDeductionResponseType) => void;
  onDelete: (deduction: EmployeeDeductionResponseType) => void;
  readOnly?: boolean;
}) {
  const totalAmount = deduction.lineItems.reduce((sum, li) => sum + li.amount, 0);

  return (
    <div className={cn('relative rounded-md border border-border p-4', deduction.isActive ? 'bg-white dark:bg-white/5' : 'bg-muted/30')}>
      <div className='absolute right-1 top-1 flex items-center gap-1.5'>
        {!readOnly && <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => onEdit(deduction)}>
          <Pencil className='h-3.5 w-3.5' />
        </Button>}
        {!readOnly && <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive hover:text-destructive' onClick={() => onDelete(deduction)}>
          <Trash2 className='h-3.5 w-3.5' />
        </Button>}
        {deduction.isActive ? (
          <span className='rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400'>Active</span>
        ) : (
          <span className='rounded-md border border-muted-foreground/30 bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground'>Inactive</span>
        )}
      </div>
      <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5'>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Total</Label>
          <p className='text-lg font-medium'>{formatAmount(totalAmount)}</p>
        </div>
        {deduction.lineItems.map((li) => {
          const label = li.type === 'other' ? `Other: ${li.otherTitle ?? 'Other'}` : (DEDUCTION_TYPE_LABELS[li.type] ?? li.type);
          const monthSuffix = li.frequency === 'specificMonth' && li.specificMonth ? ` (${formatMonthYear(li.specificMonth)})` : '';
          const frequencyLabel = li.frequency === 'monthly' ? '' : li.frequency === 'yearly' ? ' - Yearly' : '';
          return (
            <div key={li.id} className='flex flex-col gap-1'>
              <Label className='text-muted-foreground'>
                {label}{frequencyLabel}{monthSuffix}
              </Label>
              <p className='text-lg font-medium'>{formatAmount(li.amount)}</p>
            </div>
          );
        })}
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Effective from</Label>
          <p className='text-lg font-medium'>{deduction.effectiveFrom}</p>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Effective till</Label>
          <p className='text-lg font-medium'>{deduction.effectiveTill ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}

interface Props {
  employeeId: number;
  initialPage: PaginatedResponseType<EmployeeDeductionResponseType>;
  readOnly?: boolean;
}

export function EmployeeViewDeduction({ employeeId, initialPage, readOnly }: Props) {
  const router = useRouter();
  const [deductions, setDeductions] = useState<EmployeeDeductionResponseType[]>(initialPage.results);
  const [page, setPage] = useState(initialPage.page);
  const [totalRecords, setTotalRecords] = useState(initialPage.totalRecords);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<EmployeeDeductionResponseType | null>(null);
  const [deletingDeduction, setDeletingDeduction] = useState<EmployeeDeductionResponseType | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = deductions.length < totalRecords;

  const sortedDeductions = useMemo(() => {
    return [...deductions].sort((a, b) => (b.effectiveFrom || '').localeCompare(a.effectiveFrom || ''));
  }, [deductions]);

  const recentDeduction = sortedDeductions[0] ?? null;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await searchEmployeeDeductions({
        employeeId,
        pagination: { page: page + 1, limit: PAGE_SIZE },
      });
      setDeductions((prev) => [...prev, ...next.results]);
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
    async (_newDeduction: EmployeeDeductionResponseType) => {
      setAddDialogOpen(false);
      try {
        const fresh = await searchEmployeeDeductions({
          employeeId,
          pagination: { page: 1, limit: Math.max(PAGE_SIZE, totalRecords + 10) },
        });
        setDeductions(fresh.results);
        setPage(fresh.page);
        setTotalRecords(fresh.totalRecords);
      } catch {
        router.refresh();
      }
    },
    [employeeId, totalRecords],
  );

  const handleEditSuccess = (updated: EmployeeDeductionResponseType) => {
    setDeductions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setEditingDeduction(null);
    router.refresh();
  };

  const handleDeleteSuccess = () => {
    if (deletingDeduction) {
      setDeductions((prev) => prev.filter((d) => d.id !== deletingDeduction.id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
      setDeletingDeduction(null);
    }
    router.refresh();
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Deductions</h2>
        {!readOnly && (
          <Button size='sm' onClick={() => setAddDialogOpen(true)}>
            <Plus className='h-4 w-4' />
            Add deduction
          </Button>
        )}
      </div>

      {sortedDeductions.length > 0 ? (
        <>
          <DeductionCard
            deduction={sortedDeductions[0]!}
            onEdit={(d) => setEditingDeduction(d)}
            onDelete={(d) => setDeletingDeduction(d)}
            readOnly={readOnly}
          />
          {sortedDeductions.length > 1 && (
            <div className='mt-6 flex flex-col gap-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Deduction history</h3>
              {sortedDeductions.slice(1).map((d) => (
                <DeductionCard
                  key={d.id}
                  deduction={d}
                  onEdit={(ded) => setEditingDeduction(ded)}
                  onDelete={(ded) => setDeletingDeduction(ded)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className='py-4 text-sm text-muted-foreground'>No deduction records yet.</p>
      )}

      {hasMore && (
        <div ref={sentinelRef} className='flex justify-center py-4'>
          {loadingMore && <span className='text-sm text-muted-foreground'>Loading...</span>}
        </div>
      )}

      <EmployeeDeductionFormDrawer
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        employeeId={employeeId}
        lastDeduction={recentDeduction ?? undefined}
        onSuccess={handleAddSuccess}
      />
      <EmployeeDeductionFormDrawer
        open={!!editingDeduction}
        onOpenChange={(open) => !open && setEditingDeduction(null)}
        employeeId={employeeId}
        deduction={editingDeduction ?? undefined}
        onSuccess={handleEditSuccess}
      />
      <EmployeeDeductionDeleteDialog
        open={!!deletingDeduction}
        onOpenChange={(open) => !open && setDeletingDeduction(null)}
        deduction={deletingDeduction}
        employeeId={employeeId}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

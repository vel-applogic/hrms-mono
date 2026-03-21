'use client';

import type { EmployeeCompensationResponseType, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, BadgeRenderer, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColDef } from 'ag-grid-community';

import { searchEmployeeCompensations } from '@/lib/action/employee-compensation.actions';

import { EmployeeCompensationDeleteDialog } from './container/employee-compensation-delete.dialog';
import { EmployeeCompensationFormDrawer } from './container/employee-compensation-form.drawer';

const PAGE_SIZE = 10;
const TABLE_PAGE_SIZE = 10;

function formatAmount(value: number) {
  return `₹${value.toLocaleString()}`;
}

function CompensationWidget({
  title,
  compensation,
  employeeId,
  onEdit,
  onDelete,
}: {
  title: string;
  compensation: EmployeeCompensationResponseType | null;
  employeeId: number;
  onEdit?: (compensation: EmployeeCompensationResponseType) => void;
  onDelete?: (compensation: EmployeeCompensationResponseType) => void;
}) {
  if (!compensation) return null;
  return (
    <div className='relative rounded-md border border-border bg-muted/30 p-4'>
      <div className='absolute right-1 top-1 flex items-center gap-1.5'>
        {onEdit && (
          <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => onEdit(compensation)}>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
        )}
        {onDelete && (
          <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive hover:text-destructive' onClick={() => onDelete(compensation)}>
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        )}
        {compensation.isActive ? (
          <span className='rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400'>Active</span>
        ) : (
          <span className='rounded-md border border-muted-foreground/30 bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground'>Inactive</span>
        )}
      </div>
      <h3 className='mb-3 text-sm font-medium text-muted-foreground'>{title}</h3>
      <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-5'>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Gross</Label>
          <p className='text-lg font-medium'>{formatAmount(compensation.gross)}</p>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Basic</Label>
          <p className='text-lg font-medium'>{formatAmount(compensation.basic)}</p>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>HRA</Label>
          <p className='text-lg font-medium'>{formatAmount(compensation.hra)}</p>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Other Allowance</Label>
          <p className='text-lg font-medium'>{formatAmount(compensation.otherAllowances)}</p>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-muted-foreground'>Effective from</Label>
          <p className='text-lg font-medium'>{compensation.effectiveFrom}</p>
        </div>
      </div>
    </div>
  );
}

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export function EmployeeViewCompensation({ employeeId, initialPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [compensations, setCompensations] = useState<EmployeeCompensationResponseType[]>(initialPage.results);
  const [page, setPage] = useState(initialPage.page);
  const [totalRecords, setTotalRecords] = useState(initialPage.totalRecords);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingCompensation, setEditingCompensation] = useState<EmployeeCompensationResponseType | null>(null);
  const [deletingCompensation, setDeletingCompensation] = useState<EmployeeCompensationResponseType | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = compensations.length < totalRecords;

  const tablePage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const tablePageSize = Math.max(5, Math.min(100, parseInt(searchParams.get('pageSize') ?? String(TABLE_PAGE_SIZE), 10)));

  const recentCompensation = useMemo(() => {
    if (compensations.length === 0) return null;
    const sorted = [...compensations].sort((a, b) => (b.effectiveFrom || '').localeCompare(a.effectiveFrom || ''));
    return sorted[0]!;
  }, [compensations]);

  const tableRows = useMemo(() => compensations.filter((c) => c.id !== recentCompensation?.id), [compensations, recentCompensation?.id]);

  const paginatedRows = useMemo(() => {
    const start = (tablePage - 1) * tablePageSize;
    return tableRows.slice(start, start + tablePageSize);
  }, [tableRows, tablePage, tablePageSize]);

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

  const handleActionClick = useCallback((action: string, data: EmployeeCompensationResponseType) => {
    if (action === 'Edit') setEditingCompensation(data);
    if (action === 'Delete') setDeletingCompensation(data);
  }, []);

  const colDefs = useMemo<ColDef<EmployeeCompensationResponseType>[]>(
    () => [
      { headerName: 'Created at', field: 'createdAt', width: 150, cellRenderer: DateTimeRenderer },
      { headerName: 'Gross', field: 'gross', width: 120, valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : '') },
      { headerName: 'Basic', field: 'basic', width: 120, valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : '') },
      { headerName: 'HRA', field: 'hra', width: 120, valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : '') },
      { headerName: 'Other Allowance', field: 'otherAllowances', width: 140, valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : '') },
      { headerName: 'Effective from', field: 'effectiveFrom', width: 130 },
      { headerName: 'Effective till', field: 'effectiveTill', width: 130, valueFormatter: (p) => p.value ?? '—' },
      {
        headerName: 'Status',
        field: 'isActive',
        width: 100,
        cellRenderer: (params: { value?: boolean }) =>
          params.value ? (
            <BadgeRenderer text='Active' className='border border-green-500/30 bg-green-500/10 text-green-400' />
          ) : (
            <BadgeRenderer text='Inactive' className='border border-muted-foreground/30 bg-muted/50 text-muted-foreground' />
          ),
      },
      {
        headerName: 'Actions',
        colId: 'actions',
        sortable: false,
        resizable: false,
        pinned: 'right',
        width: 90,
        cellClass: '!flex items-center !justify-center',
        cellRenderer: ActionsIconCellRenderer<EmployeeCompensationResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<EmployeeCompensationResponseType>>,
      },
    ],
    [],
  );

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Compensation</h2>
        <Button size='sm' onClick={() => setAddDialogOpen(true)}>
          <Plus className='h-4 w-4' />
          Add compensation
        </Button>
      </div>

      {recentCompensation && (
        <div className='mb-6'>
          <CompensationWidget
            title='Recent compensation'
            compensation={recentCompensation}
            employeeId={employeeId}
            onEdit={(c) => setEditingCompensation(c)}
            onDelete={(c) => setDeletingCompensation(c)}
          />
        </div>
      )}

      {tableRows.length > 0 && (
        <div className='flex min-h-0 flex-1 flex-col'>
          <h3 className='mb-3 text-sm font-medium text-muted-foreground'>Compensation history</h3>
          <div className='min-h-[200px] flex-1'>
            <DataTableSimple<EmployeeCompensationResponseType>
              tableKey='employee-compensation-history'
              rowData={paginatedRows}
              pagination={{
                page: tablePage,
                pageSize: tablePageSize,
                total: tableRows.length,
              }}
              colDefs={colDefs}
              onActionClick={handleActionClick}
              autoHeight
            />
          </div>
        </div>
      )}

      {compensations.length === 0 && <p className='py-4 text-sm text-muted-foreground'>No compensation records yet.</p>}
      {tableRows.length === 0 && compensations.length > 0 && <p className='py-4 text-sm text-muted-foreground'>No additional compensation entries beyond the recent one.</p>}
      {hasMore && (
        <div ref={sentinelRef} className='flex justify-center py-4'>
          {loadingMore && <span className='text-sm text-muted-foreground'>Loading...</span>}
        </div>
      )}

      <EmployeeCompensationFormDrawer open={addDialogOpen} onOpenChange={setAddDialogOpen} employeeId={employeeId} onSuccess={handleAddSuccess} />
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
}

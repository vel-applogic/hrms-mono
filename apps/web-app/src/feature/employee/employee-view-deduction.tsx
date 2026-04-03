'use client';

import type { EmployeeDeductionResponseType, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import {
  ActionOption,
  ActionsIconCellRenderer,
  ActionsIconCellRendererParams,
  BadgeRenderer,
  DateTimeRenderer,
} from '@repo/ui/container/datatable/datatable-cell-renderer';
import { Button } from '@repo/ui/component/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColDef } from 'ag-grid-community';

import { searchEmployeeDeductions } from '@/lib/action/employee-deduction.actions';

import { EmployeeDeductionDeleteDialog } from './container/employee-deduction-delete.dialog';
import { EmployeeDeductionFormDrawer } from './container/employee-deduction-form.drawer';

const PAGE_SIZE = 10;
const TABLE_PAGE_SIZE = 10;

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

function getLineItemsSummary(d: EmployeeDeductionResponseType): string {
  return d.lineItems
    .map((li) => {
      const label = li.type === 'other' ? `Other: ${li.otherTitle ?? 'Other'}` : (DEDUCTION_TYPE_LABELS[li.type] ?? li.type);
      const monthSuffix = li.frequency === 'specificMonth' && li.specificMonth ? ` [${formatMonthYear(li.specificMonth)}]` : '';
      return `${label} (${formatAmount(li.amount)})${monthSuffix}`;
    })
    .join(', ');
}

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

type DeductionRow = {
  id: number;
  lineItemsSummary: string;
  totalAmount: number;
  effectiveFrom: string;
  effectiveTill: string | null | undefined;
  isActive: boolean;
  createdAt: string;
  _original: EmployeeDeductionResponseType;
};

interface Props {
  employeeId: number;
  initialPage: PaginatedResponseType<EmployeeDeductionResponseType>;
}

export function EmployeeViewDeduction({ employeeId, initialPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deductions, setDeductions] = useState<EmployeeDeductionResponseType[]>(initialPage.results);
  const [page, setPage] = useState(initialPage.page);
  const [totalRecords, setTotalRecords] = useState(initialPage.totalRecords);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<EmployeeDeductionResponseType | null>(null);
  const [deletingDeduction, setDeletingDeduction] = useState<EmployeeDeductionResponseType | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = deductions.length < totalRecords;

  const tablePage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const tablePageSize = Math.max(5, Math.min(100, parseInt(searchParams.get('pageSize') ?? String(TABLE_PAGE_SIZE), 10)));

  const tableRows = useMemo((): DeductionRow[] => {
    return deductions.map((d) => ({
      id: d.id,
      lineItemsSummary: getLineItemsSummary(d),
      totalAmount: d.lineItems.reduce((sum, li) => sum + li.amount, 0),
      effectiveFrom: d.effectiveFrom,
      effectiveTill: d.effectiveTill,
      isActive: d.isActive,
      createdAt: d.createdAt,
      _original: d,
    }));
  }, [deductions]);

  const paginatedRows = useMemo(() => {
    const start = (tablePage - 1) * tablePageSize;
    return tableRows.slice(start, start + tablePageSize);
  }, [tableRows, tablePage, tablePageSize]);

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

  const handleActionClick = useCallback(
    (action: string, data: DeductionRow) => {
      if (action === 'Edit') setEditingDeduction(data._original);
      if (action === 'Delete') setDeletingDeduction(data._original);
    },
    [],
  );

  const colDefs = useMemo<ColDef<DeductionRow>[]>(
    () => [
      { headerName: 'Line items', field: 'lineItemsSummary', flex: 1, minWidth: 250 },
      { headerName: 'Total', field: 'totalAmount', width: 120, valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : '') },
      { headerName: 'Effective from', field: 'effectiveFrom', width: 130 },
      { headerName: 'Effective till', field: 'effectiveTill', width: 130, valueFormatter: (p) => (p.value ?? '—') },
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
      { headerName: 'Created at', field: 'createdAt', width: 150, cellRenderer: DateTimeRenderer },
      {
        headerName: 'Actions',
        colId: 'actions',
        sortable: false,
        resizable: false,
        pinned: 'right',
        width: 90,
        cellClass: '!flex items-center !justify-center',
        cellRenderer: ActionsIconCellRenderer<DeductionRow>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<DeductionRow>>,
      },
    ],
    [],
  );

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Deductions</h2>
        <Button size='sm' onClick={() => setAddDialogOpen(true)}>
          <Plus className='h-4 w-4' />
          Add deduction
        </Button>
      </div>

      {deductions.length > 0 ? (
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-[200px] flex-1'>
            <DataTableSimple<DeductionRow>
              tableKey='employee-deduction'
              rowData={paginatedRows}
              pagination={{
                page: tablePage,
                pageSize: tablePageSize,
                total: deductions.length,
              }}
              colDefs={colDefs}
              onActionClick={handleActionClick}
              autoHeight
            />
          </div>
        </div>
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

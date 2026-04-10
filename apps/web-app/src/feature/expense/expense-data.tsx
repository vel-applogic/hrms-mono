'use client';

import type { ExpenseResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { expenseTypeDtoEnumToReadableLabel } from '@repo/shared';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Button } from '@repo/ui/component/ui/button';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import type { ColDef } from 'ag-grid-community';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ExpenseForecastWidget } from '@/feature/expense-forecast/component/expense-forecast-widget';

import { ExpenseSummaryWidget } from './component/expense-summary-widget';
import { ExpenseDeleteDialog } from './container/expense-delete.dialog';
import { ExpenseUpsertDrawer } from './container/expense-upsert.drawer';

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

interface Props {
  data: PaginatedResponseType<ExpenseResponseType>;
  searchParams: SearchParamsType;
  currentFinancialYear: string;
  financialYearOptions: { value: string; label: string }[];
}

export function ExpenseData({ data, searchParams, currentFinancialYear, financialYearOptions }: Props) {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseResponseType | null>(null);
  const [widgetRefreshKey, setWidgetRefreshKey] = useState(0);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    searchParams.months ? searchParams.months.map(String) : [],
  );

  const handleFinancialYearChange = (value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.set('financialYear', value);
    params.set('page', '1');
    replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const handleMonthFilterChange = (values: string[]) => {
    setSelectedMonths(values);
    const params = new URLSearchParams(currentSearchParams.toString());
    if (values.length > 0) {
      params.set('months', values.join(','));
    } else {
      params.delete('months');
    }
    params.set('page', '1');
    replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const handleClearAll = () => {
    setSearchText('');
    setSelectedMonths([]);
    replace(pathname);
  };

  const hasActiveFilters = searchText.trim().length > 0 || selectedMonths.length > 0;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(currentSearchParams.toString());
      const query = searchText.trim();
      const searchChanged = searchText !== prevSearchTextRef.current;
      prevSearchTextRef.current = searchText;

      if (query.length > 0) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      if (searchChanged) {
        params.set('page', '1');
      }

      const nextQueryString = params.toString();
      const currentQueryString = currentSearchParams.toString();
      if (nextQueryString === currentQueryString) return;

      replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchText, currentSearchParams, pathname, replace]);

  const handleAddNew = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEdit = (expense: ExpenseResponseType) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleDelete = (expense: ExpenseResponseType) => {
    setDeletingExpense(expense);
    setDeleteDialogOpen(true);
  };

  const colDefs: ColDef<ExpenseResponseType>[] = [
    {
      headerName: '#',
      colId: 'serial',
      width: 60,
      sortable: false,
      valueGetter: (params) => (params.node?.rowIndex != null ? params.node.rowIndex + 1 : ''),
    },
    {
      headerName: 'Date',
      field: 'date',
      width: 140,
      valueFormatter: (p) => {
        if (!p.value) return '';
        const d = new Date(p.value + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      },
    },
    {
      headerName: 'Type',
      field: 'type',
      width: 160,
      valueFormatter: (p) => (p.value ? expenseTypeDtoEnumToReadableLabel(p.value) : ''),
    },
    {
      headerName: 'Description',
      field: 'description',
      flex: 2,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      width: 140,
      valueFormatter: (p) => (p.value != null ? `₹ ${Number(p.value).toLocaleString('en-IN')}` : ''),
      cellStyle: { justifyContent: 'end' },
      headerClass: 'ag-right-aligned-header',
    },
    {
      headerName: '',
      colId: 'actions',
      sortable: false,
      resizable: false,
      pinned: 'right',
      width: 120,
      cellClass: '!flex items-center !justify-center !px-0',
      cellRenderer: (params: { data?: ExpenseResponseType }) => {
        if (!params.data) return null;
        const expense = params.data;
        return (
          <div className='flex h-full w-full items-center justify-center gap-2 px-2'>
            <button
              onClick={() => handleEdit(expense)}
              className='inline-flex items-center justify-center rounded-md p-2 text-warning transition-colors hover:bg-warning/10 hover:text-warning'
              title='Edit'
            >
              <Pencil className='h-4 w-4' />
            </button>
            <button
              onClick={() => handleDelete(expense)}
              className='inline-flex items-center justify-center rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive'
              title='Delete'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <ExpenseSummaryWidget refreshKey={widgetRefreshKey} financialYearCode={currentFinancialYear} compact />
        <ExpenseForecastWidget refreshKey={widgetRefreshKey} showEdit compact />
      </div>

      <div className='center-container flex flex-wrap items-end gap-3'>
        <div className='flex flex-col gap-1'>
          <span className='text-xs text-muted-foreground'>Financial Year</span>
          <Select value={currentFinancialYear} onValueChange={handleFinancialYearChange}>
            <SelectTrigger className='h-10 w-[140px]'>
              <SelectValue placeholder='Financial Year' />
            </SelectTrigger>
            <SelectContent>
              {financialYearOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col gap-1 w-[200px]'>
          <span className='text-xs text-muted-foreground'>Month</span>
          <SelectSearchMulti
            values={selectedMonths}
            options={MONTH_OPTIONS}
            placeholder='All months'
            searchPlaceholder='Search months...'
            onChange={handleMonthFilterChange}
          />
        </div>
        <div className='flex flex-col gap-1 min-w-[250px]'>
          <span className='text-xs text-muted-foreground'>Search</span>
          <div className='flex h-10 items-center gap-3 rounded-[40px] border border-input bg-white px-4'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M7.33 12.67A5.33 5.33 0 1 0 7.33 2a5.33 5.33 0 0 0 0 10.67ZM14 14l-2.9-2.9'
                stroke='#848A91'
                strokeWidth='1.33'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <input
              type='text'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder='Search expenses...'
              className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
        </div>
        {hasActiveFilters && (
          <Button variant='outline' size='sm' onClick={handleClearAll} className='shrink-0'>
            <X className='h-4 w-4' />
            Clear
          </Button>
        )}
        <div className='ml-auto'>
          <Button className='rounded-[40px]' onClick={handleAddNew}>
            <Plus className='h-4 w-4' />
            Add expense
          </Button>
        </div>
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0'>
        <DataTableSimple<ExpenseResponseType>
          tableKey='expense-table'
          rowData={data.results}
          colDefs={colDefs}
          pagination={{
            page: data.page,
            pageSize: data.limit,
            total: data.totalRecords,
          }}
        />
      </div>

      <ExpenseUpsertDrawer open={modalOpen} onOpenChange={setModalOpen} expense={editingExpense} onSuccess={() => { refresh(); setWidgetRefreshKey((k) => k + 1); }} />
      <ExpenseDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} expense={deletingExpense} onSuccess={() => { refresh(); setWidgetRefreshKey((k) => k + 1); }} />
    </div>
  );
}

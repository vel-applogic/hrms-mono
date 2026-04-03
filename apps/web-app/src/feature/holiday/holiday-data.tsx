'use client';

import type { HolidayResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { holidayTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Button } from '@repo/ui/component/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/component/shadcn/select';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ColDef } from 'ag-grid-community';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { HolidayDeleteDialog } from './container/holiday-delete.dialog';
import { HolidayUpsertModal } from './container/holiday-upsert.modal';

interface Props {
  data: PaginatedResponseType<HolidayResponseType>;
  searchParams: SearchParamsType;
  years: number[];
  selectedYear: number;
}

export function HolidayData({ data, searchParams, years, selectedYear }: Props) {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingHoliday, setDeletingHoliday] = useState<HolidayResponseType | null>(null);

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

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.set('year', value);
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleAddNew = () => {
    setEditingHoliday(null);
    setModalOpen(true);
  };

  const handleEdit = (holiday: HolidayResponseType) => {
    setEditingHoliday(holiday);
    setModalOpen(true);
  };

  const handleDelete = (holiday: HolidayResponseType) => {
    setDeletingHoliday(holiday);
    setDeleteDialogOpen(true);
  };

  const getDaySuffix = (day: number) => {
    if (day % 10 === 1 && day !== 11) return 'st';
    if (day % 10 === 2 && day !== 12) return 'nd';
    if (day % 10 === 3 && day !== 13) return 'rd';
    return 'th';
  };

  const colDefs: ColDef<HolidayResponseType>[] = [
    {
      headerName: '#',
      colId: 'serial',
      width: 60,
      sortable: false,
      valueGetter: (params) => (params.node?.rowIndex != null ? params.node.rowIndex + 1 : ''),
    },
    {
      headerName: 'Day',
      field: 'date',
      width: 110,
      valueFormatter: (p) => {
        if (!p.value) return '';
        const d = new Date(p.value + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long' });
      },
    },
    {
      headerName: 'Date',
      field: 'date',
      width: 180,
      cellRenderer: (params: { value?: string }) => {
        if (!params.value) return null;
        const d = new Date(params.value + 'T00:00:00');
        const day = d.getDate();
        const suffix = getDaySuffix(day);
        const month = d.toLocaleDateString('en-US', { month: 'long' });
        const year = d.getFullYear();
        return (
          <span>
            {day}<sup>{suffix}</sup> {month} {year}
          </span>
        );
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 2,
    },
    {
      headerName: 'Type',
      width: 160,
      valueGetter: (params) => {
        if (!params.data) return '';
        return params.data.types.map((t) => holidayTypeDtoEnumToReadableLabel(t)).join(', ');
      },
    },
    {
      headerName: '',
      colId: 'actions',
      sortable: false,
      resizable: false,
      pinned: 'right',
      width: 100,
      cellRenderer: (params: { data?: HolidayResponseType }) => {
        if (!params.data) return null;
        const holiday = params.data;
        return (
          <div className='flex items-center gap-1'>
            <button
              onClick={() => handleEdit(holiday)}
              className='inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground'
            >
              <Pencil className='h-4 w-4' />
            </button>
            <button
              onClick={() => handleDelete(holiday)}
              className='inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive'
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
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-muted-foreground'>
          {data.totalRecords > 0
            ? `Showing records: ${(data.page - 1) * data.limit + 1} - ${Math.min(data.page * data.limit, data.totalRecords)} of ${data.totalRecords}`
            : 'No records found'}
        </span>
        <div className='flex items-center gap-3'>
          <Select value={String(selectedYear)} onValueChange={handleYearChange}>
            <SelectTrigger className='h-10 w-[120px]'>
              <SelectValue placeholder='Year' />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='flex h-10 w-[260px] shrink-0 items-center gap-3 rounded-[40px] border border-input bg-white px-4'>
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
              placeholder='Search holidays...'
              className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
          <Button className='shrink-0 rounded-[40px]' onClick={handleAddNew}>
            <Plus className='h-4 w-4' />
            Add holiday
          </Button>
        </div>
      </div>

      <div className='min-h-0 flex-1'>
        <DataTableSimple<HolidayResponseType>
          tableKey='holiday-table'
          rowData={data.results}
          colDefs={colDefs}
          pagination={{
            page: data.page,
            pageSize: data.limit,
            total: data.totalRecords,
          }}
        />
      </div>

      <HolidayUpsertModal open={modalOpen} onOpenChange={setModalOpen} holiday={editingHoliday} onSuccess={() => refresh()} />
      <HolidayDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} holiday={deletingHoliday} onSuccess={() => refresh()} />
    </div>
  );
}

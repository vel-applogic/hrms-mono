'use client';

import type { LeaveCounterResponseType } from '@repo/dto';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/shadcn/select';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ColDef } from 'ag-grid-community';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type SelectOption = { value: string; label: string };

interface Props {
  counters: LeaveCounterResponseType[];
  financialYear: string;
  financialYearOptions: SelectOption[];
}

export const LeaveCounterData = ({ counters, financialYear, financialYearOptions }: Props) => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchText, setSearchText] = useState('');

  const handleFinancialYearChange = (value: string) => {
    replace(`${pathname}?financialYear=${value}`);
  };

  const filteredCounters = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return counters;
    return counters.filter((c) => {
      const fullName = `${c.user.firstname} ${c.user.lastname}`.toLowerCase();
      const email = (c.user.email ?? '').toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }, [counters, searchText]);

  const colDefs = useMemo<ColDef<LeaveCounterResponseType>[]>(
    () => [
      {
        headerName: 'Id',
        field: 'id',
        width: 80,
      },
      {
        headerName: 'Employee',
        flex: 2,
        valueGetter: (params) => (params.data ? `${params.data.user.firstname} ${params.data.user.lastname}` : ''),
      },
      {
        headerName: 'Email',
        flex: 2,
        valueGetter: (params) => params.data?.user?.email ?? '',
      },
      {
        headerName: 'Financial Year',
        field: 'financialYear',
        width: 110,
      },
      {
        headerName: 'Casual',
        field: 'casualLeaves',
        width: 90,
      },
      {
        headerName: 'Sick',
        field: 'sickLeaves',
        width: 90,
      },
      {
        headerName: 'Earned',
        field: 'earnedLeaves',
        width: 90,
      },
      {
        headerName: 'Total Used',
        field: 'totalLeavesUsed',
        width: 110,
      },
      {
        headerName: 'Total Available',
        field: 'totalLeavesAvailable',
        width: 130,
      },
      {
        headerName: 'View Leaves',
        colId: 'view',
        width: 120,
        sortable: false,
        cellRenderer: (params: { data?: LeaveCounterResponseType }) => {
          if (!params.data) return null;
          return (
            <Link href={`/employee/${params.data.userId}/leave?financialYear=${params.data.financialYear}`} className='text-primary hover:underline'>
              View
            </Link>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex items-center justify-start gap-3'>
        <div className='flex h-10 w-[260px] items-center gap-3 rounded-[40px] border border-input bg-white px-4'>
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
              placeholder='Search by name or email...'
              className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
          <Select value={financialYear} onValueChange={handleFinancialYearChange}>
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

      <div className='flex flex-1 flex-col min-h-0 pb-4'>
        <DataTableSimple<LeaveCounterResponseType>
          colDefs={colDefs}
          pagination={{
            page: 1,
            pageSize: filteredCounters.length || 50,
            total: filteredCounters.length,
          }}
          rowData={filteredCounters}
          tableKey='leave-counter-table'
        />
      </div>
    </div>
  );
};

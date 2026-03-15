'use client';

import type { LeaveCounterResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/component/shadcn/select';
import { ColDef } from 'ag-grid-community';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

type SelectOption = { value: string; label: string };

interface Props {
  counters: LeaveCounterResponseType[];
  financialYear: string;
  financialYearOptions: SelectOption[];
}

export const LeaveCounterData = ({ counters, financialYear, financialYearOptions }: Props) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFinancialYearChange = (value: string) => {
    replace(`${pathname}?financialYear=${value}`);
  };

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
        valueGetter: (params) =>
          params.data ? `${params.data.user.firstname} ${params.data.user.lastname}` : '',
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
            <Link
              href={`/leaves/details?userId=${params.data.userId}&financialYear=${params.data.financialYear}`}
              className='text-primary hover:underline'
            >
              View
            </Link>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <span className='text-xl font-medium tracking-tight text-white'>Leave Counters</span>
        <div className='flex items-center gap-2'>
          <Button variant='outline' className='shrink-0 rounded-[40px]' asChild>
            <Link href={`/leaves/details?financialYear=${financialYear}`} className='flex items-center gap-2'>
              <CalendarDays className='h-4 w-4' />
              Leave Details
            </Link>
          </Button>
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
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0 pb-4'>
        <DataTableSimple<LeaveCounterResponseType>
          colDefs={colDefs}
          pagination={{
            page: 1,
            pageSize: counters.length || 50,
            total: counters.length,
          }}
          rowData={counters}
          tableKey='leave-counter-table'
        />
      </div>
    </div>
  );
};

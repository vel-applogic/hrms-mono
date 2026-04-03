'use client';

import type { PaginatedResponseType, PayrollActiveCompensationResponseType, SearchParamsType } from '@repo/dto';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ColDef } from 'ag-grid-community';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function formatAmount(value: number) {
  return `₹${value.toLocaleString()}`;
}

interface Props {
  data: PaginatedResponseType<PayrollActiveCompensationResponseType>;
  searchParams: SearchParamsType;
}

export function PayrollCompensationData({ data, searchParams }: Props) {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);

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

  const colDefs: ColDef<PayrollActiveCompensationResponseType>[] = [
    {
      headerName: 'Emp Code',
      field: 'employeeCode',
      width: 120,
    },
    {
      headerName: 'Employee',
      flex: 2,
      valueGetter: (params) => (params.data ? `${params.data.employeeFirstname} ${params.data.employeeLastname}` : ''),
    },
    {
      headerName: 'Email',
      field: 'employeeEmail',
      flex: 2,
    },
    {
      headerName: 'Gross',
      field: 'grossAmount',
      width: 120,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : ''),
    },
    {
      headerName: 'Line items',
      flex: 2,
      autoHeight: true,
      cellRenderer: (params: { data?: PayrollActiveCompensationResponseType }) => {
        if (!params.data) return null;
        return (
          <div className='flex flex-col gap-0.5 py-1 text-xs'>
            {params.data.lineItems.map((li, idx) => (
              <span key={idx}>
                {li.title}: {formatAmount(li.amount)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      headerName: 'Effective from',
      field: 'effectiveFrom',
      width: 130,
    },
    {
      headerName: '',
      colId: 'view',
      sortable: false,
      resizable: false,
      pinned: 'right',
      width: 60,
      cellRenderer: (params: { data?: PayrollActiveCompensationResponseType }) => {
        if (!params.data) return null;
        return (
          <Link
            href={`/employee/${params.data.employeeId}/compensation`}
            className='inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <Eye className='h-4 w-4' />
          </Link>
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
        <div className='flex h-10 w-[298px] shrink-0 items-center gap-3 rounded-[40px] border border-input bg-white px-4'>
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
            placeholder='Search by name, email or code...'
            className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
          />
        </div>
      </div>

      <div className='min-h-0 flex-1'>
        <DataTableSimple<PayrollActiveCompensationResponseType>
          tableKey='payroll-compensation-table'
          rowData={data.results}
          colDefs={colDefs}
          pagination={{
            page: data.page,
            pageSize: data.limit,
            total: data.totalRecords,
          }}
        />
      </div>

      {data.results.length === 0 && <p className='py-4 text-sm text-muted-foreground'>No active compensation records found.</p>}
    </div>
  );
}

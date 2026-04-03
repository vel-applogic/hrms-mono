'use client';

import type { PaginatedResponseType, PayrollActiveCompensationResponseType, SearchParamsType } from '@repo/dto';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ColDef } from 'ag-grid-community';
import { Eye } from 'lucide-react';
import Link from 'next/link';

function formatAmount(value: number) {
  return `₹${value.toLocaleString()}`;
}

interface Props {
  data: PaginatedResponseType<PayrollActiveCompensationResponseType>;
  searchParams: SearchParamsType;
}

export function PayrollCompensationData({ data, searchParams }: Props) {
  const colDefs: ColDef<PayrollActiveCompensationResponseType>[] = [
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
      valueGetter: (params) => {
        if (!params.data) return '';
        return params.data.lineItems.map((li) => `${li.title}: ${formatAmount(li.amount)}`).join(', ');
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
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-muted-foreground'>
          {data.totalRecords > 0
            ? `Showing records: ${(data.page - 1) * data.limit + 1} - ${Math.min(data.page * data.limit, data.totalRecords)} of ${data.totalRecords}`
            : 'No records found'}
        </span>
      </div>

      <div className='min-h-[200px] flex-1'>
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

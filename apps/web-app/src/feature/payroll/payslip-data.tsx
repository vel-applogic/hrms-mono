'use client';

import type { EmployeeListResponseType, PayslipDetailResponseType, PayslipListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/shadcn/select';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ColDef } from 'ag-grid-community';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { searchPayslips } from '@/lib/action/payslip.actions';
import { getEmployeesList } from '@/lib/action/employee.actions';
import { PayslipGenerateDrawer } from './payslip-generate.drawer';
import { PayslipViewDrawer } from './payslip-view.drawer';
import { PayslipEditLineItemsDrawer } from './payslip-edit-line-items.drawer';

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatAmount(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function PayslipData() {
  const now = new Date();
  const [month, setMonth] = useState<string>(String(now.getMonth() + 1));
  const [year, setYear] = useState<string>(String(now.getFullYear()));
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);

  const [data, setData] = useState<{ results: PayslipListResponseType[]; totalRecords: number; page: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [viewPayslipId, setViewPayslipId] = useState<number | null>(null);
  const [editPayslipId, setEditPayslipId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    getEmployeesList()
      .then((employees: EmployeeListResponseType[]) =>
        setEmployeeOptions(
          employees.map((e) => ({
            value: String(e.id),
            label: `${e.firstname} ${e.lastname}`,
            keywords: [e.email],
          })),
        ),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [month, year, selectedEmployeeIds, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await searchPayslips({
        pagination: { page, limit },
        month: month ? parseInt(month, 10) : undefined,
        year: year && !isNaN(parseInt(year, 10)) ? parseInt(year, 10) : undefined,
        employeeIds: selectedEmployeeIds.length > 0 ? selectedEmployeeIds.map(Number) : undefined,
      });
      setData(result);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = (updated: PayslipDetailResponseType) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            results: prev.results.map((p) =>
              p.id === updated.id
                ? {
                    ...p,
                    grossAmount: updated.grossAmount,
                    deductionAmount: updated.deductionAmount,
                    netAmount: updated.netAmount,
                  }
                : p,
            ),
          }
        : prev,
    );
  };

  const colDefs: ColDef<PayslipListResponseType>[] = [
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
      headerName: 'Month',
      field: 'month',
      width: 110,
      valueFormatter: (p) => (p.value != null ? MONTH_LABELS[p.value - 1] : ''),
    },
    {
      headerName: 'Year',
      field: 'year',
      width: 80,
    },
    {
      headerName: 'Gross',
      field: 'grossAmount',
      width: 120,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : ''),
    },
    {
      headerName: 'Deductions',
      field: 'deductionAmount',
      width: 120,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : ''),
    },
    {
      headerName: 'Net Pay',
      field: 'netAmount',
      width: 120,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value) : ''),
      cellStyle: { fontWeight: '600' },
    },
    {
      headerName: '',
      colId: 'actions',
      sortable: false,
      resizable: false,
      pinned: 'right',
      width: 90,
      cellRenderer: (params: { data?: PayslipListResponseType }) => {
        if (!params.data) return null;
        const payslipId = params.data.id;
        return (
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setViewPayslipId(payslipId)}
              className='inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-white'
              title='View payslip'
            >
              <Eye className='h-4 w-4' />
            </button>
            <button
              onClick={() => setEditPayslipId(payslipId)}
              className='inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-white'
              title='Edit line items'
            >
              <Pencil className='h-4 w-4' />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex flex-wrap items-end gap-3'>
        <div className='flex flex-col gap-1 min-w-[130px]'>
          <span className='text-xs text-muted-foreground'>Month</span>
          <Select
            value={month || 'all'}
            onValueChange={(v) => {
              setMonth(v === 'all' ? '' : v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='All months' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All months</SelectItem>
              {MONTH_LABELS.map((label, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-1 w-[90px]'>
          <span className='text-xs text-muted-foreground'>Year</span>
          <Input
            type='number'
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            placeholder='Any'
            min={2000}
            max={2100}
          />
        </div>

        <div className='flex flex-col gap-1 min-w-[200px] flex-1'>
          <span className='text-xs text-muted-foreground'>Employees</span>
          <SelectSearchMulti
            values={selectedEmployeeIds}
            options={employeeOptions}
            placeholder='All employees'
            searchPlaceholder='Search employees...'
            onChange={(vals) => {
              setSelectedEmployeeIds(vals);
              setPage(1);
            }}
          />
        </div>

        <div className='ml-auto'>
          <Button onClick={() => setGenerateOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Generate Payslip
          </Button>
        </div>
      </div>

      {/* Record count */}
      <div className='flex items-center justify-between'>
        <span className='text-sm text-muted-foreground'>
          {loading
            ? 'Loading…'
            : data && data.totalRecords > 0
              ? `Showing ${(data.page - 1) * data.limit + 1}–${Math.min(data.page * data.limit, data.totalRecords)} of ${data.totalRecords} records`
              : 'No payslips found'}
        </span>
      </div>

      {/* Table */}
      <div className='min-h-[300px] flex-1'>
        <DataTableSimple<PayslipListResponseType>
          tableKey='payroll-payslip-table'
          rowData={data?.results ?? []}
          colDefs={colDefs}
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.limit ?? limit,
            total: data?.totalRecords ?? 0,
          }}
        />
      </div>

      {/* Drawers */}
      <PayslipGenerateDrawer open={generateOpen} onOpenChange={setGenerateOpen} onSuccess={fetchData} />

      <PayslipViewDrawer
        open={viewPayslipId != null}
        onOpenChange={(open) => {
          if (!open) setViewPayslipId(null);
        }}
        payslipId={viewPayslipId}
      />

      <PayslipEditLineItemsDrawer
        open={editPayslipId != null}
        onOpenChange={(open) => {
          if (!open) setEditPayslipId(null);
        }}
        payslipId={editPayslipId}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

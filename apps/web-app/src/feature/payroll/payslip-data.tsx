'use client';

import type { EmployeeListResponseType, PayslipDetailResponseType, PayslipListResponseType } from '@repo/dto';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/shadcn/select';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ColDef } from 'ag-grid-community';
import { Download, Eye, Loader2, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';
import { getPayslipPdfSignedUrl, searchPayslips } from '@/lib/action/payslip.actions';

import { PayslipEditLineItemsDrawer } from './payslip-edit-line-items.drawer';
import { PayslipGenerateDrawer } from './payslip-generate.drawer';
import { PayslipViewDrawer } from './payslip-view.drawer';

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatAmount(value: number, currencySymbol: string | null | undefined, currencyCode: string | undefined) {
  const prefix = currencySymbol ?? currencyCode ?? '';
  return `${prefix} ${value.toLocaleString('en-IN')}`;
}

function DownloadButton({ onDownload }: { onDownload: () => Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onDownload();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className='inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
      title='Download PDF'
    >
      {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Download className='h-4 w-4' />}
    </button>
  );
}

export function PayslipData() {
  const now = new Date();
  const [month, setMonth] = useState<string>('');
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

  const handleDownloadPdf = async (payslipId: number) => {
    const signedUrl = await getPayslipPdfSignedUrl(payslipId);
    window.open(signedUrl, '_blank', 'noopener,noreferrer');
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
      headerName: 'Period',
      colId: 'period',
      width: 160,
      valueGetter: (p) => {
        if (!p.data) return '';
        const month = p.data.month != null ? MONTH_LABELS[p.data.month - 1] : '';
        return `${month} ${p.data.year ?? ''}`.trim();
      },
    },
    {
      headerName: 'Gross',
      field: 'grossAmount',
      width: 120,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value, p.data?.currencySymbol, p.data?.currencyCode) : ''),
    },
    {
      headerName: 'Deductions',
      field: 'deductionAmount',
      width: 120,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value, p.data?.currencySymbol, p.data?.currencyCode) : ''),
    },
    {
      headerName: 'Net Pay',
      field: 'netAmount',
      width: 120,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value, p.data?.currencySymbol, p.data?.currencyCode) : ''),
      cellStyle: { fontWeight: '600' },
    },
    {
      headerName: '',
      colId: 'actions',
      sortable: false,
      resizable: false,
      pinned: 'right',
      width: 120,
      cellRenderer: (params: { data?: PayslipListResponseType }) => {
        if (!params.data) return null;
        const payslipId = params.data.id;
        return (
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setViewPayslipId(payslipId)}
              className='inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
              title='View payslip'
            >
              <Eye className='h-4 w-4' />
            </button>
            <DownloadButton onDownload={() => handleDownloadPdf(payslipId)} />
            <button
              onClick={() => setEditPayslipId(payslipId)}
              className='inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
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

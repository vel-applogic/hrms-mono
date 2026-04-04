'use client';

import type { PayslipDetailResponseType, PayslipListResponseType, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ColDef } from 'ag-grid-community';
import { Download, Eye, Loader2, Pencil } from 'lucide-react';
import { useCallback, useState } from 'react';

import { getPayslipPdfSignedUrl, searchPayslips } from '@/lib/action/payslip.actions';
import { PayslipEditLineItemsDrawer } from '@/feature/payroll/payslip-edit-line-items.drawer';
import { PayslipViewDrawer } from '@/feature/payroll/payslip-view.drawer';

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PAGE_SIZE = 50;

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

interface Props {
  employeeId: number;
  initialPage: PaginatedResponseType<PayslipListResponseType>;
}

export function EmployeeViewPayslip({ employeeId, initialPage }: Props) {
  const [data, setData] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage.page);
  const [viewPayslipId, setViewPayslipId] = useState<number | null>(null);
  const [editPayslipId, setEditPayslipId] = useState<number | null>(null);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await searchPayslips({
        pagination: { page: p, limit: PAGE_SIZE },
        employeeIds: [employeeId],
      });
      setData(result);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const handleDownloadPdf = async (payslipId: number) => {
    const signedUrl = await getPayslipPdfSignedUrl(payslipId);
    window.open(signedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEditSuccess = (updated: PayslipDetailResponseType) => {
    setData((prev) => ({
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
    }));
  };

  const colDefs: ColDef<PayslipListResponseType>[] = [
    {
      headerName: 'Month',
      field: 'month',
      width: 130,
      valueFormatter: (p) => (p.value != null ? MONTH_LABELS[p.value - 1] : ''),
    },
    {
      headerName: 'Year',
      field: 'year',
      width: 90,
    },
    {
      headerName: 'Gross',
      field: 'grossAmount',
      width: 130,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value, p.data?.currencySymbol, p.data?.currencyCode) : ''),
    },
    {
      headerName: 'Deductions',
      field: 'deductionAmount',
      width: 130,
      valueFormatter: (p) => (p.value != null ? formatAmount(p.value, p.data?.currencySymbol, p.data?.currencyCode) : ''),
    },
    {
      headerName: 'Net Pay',
      field: 'netAmount',
      flex: 1,
      minWidth: 130,
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
    <div className='flex h-full flex-col'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Payslips</h2>
        <span className='text-sm text-muted-foreground'>
          {loading ? 'Loading...' : `${data.totalRecords} record${data.totalRecords !== 1 ? 's' : ''}`}
        </span>
      </div>

      {data.results.length > 0 ? (
        <div className='min-h-[300px] flex-1'>
          <DataTableSimple<PayslipListResponseType>
            tableKey='employee-payslip-table'
            rowData={data.results}
            colDefs={colDefs}
            pagination={{
              page: data.page,
              pageSize: data.limit,
              total: data.totalRecords,
            }}
            autoHeight
          />
        </div>
      ) : (
        <p className='py-4 text-sm text-muted-foreground'>No payslip records found.</p>
      )}

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

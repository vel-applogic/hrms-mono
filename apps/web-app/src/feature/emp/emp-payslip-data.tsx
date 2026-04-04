'use client';

import type { PayslipDetailResponseType, PayslipListResponseType, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ColDef } from 'ag-grid-community';
import { Download, Eye, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { getPayslipPdfSignedUrl, searchPayslips } from '@/lib/action/payslip.actions';
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

export function EmpPayslipData({ employeeId, initialPage }: Props) {
  const [data, setData] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [viewPayslipId, setViewPayslipId] = useState<number | null>(null);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await searchPayslips({
        pagination: { page: p, limit: PAGE_SIZE },
        employeeIds: [employeeId],
      });
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const handleDownloadPdf = async (payslipId: number) => {
    const signedUrl = await getPayslipPdfSignedUrl(payslipId);
    window.open(signedUrl, '_blank', 'noopener,noreferrer');
  };

  const colDefs: ColDef<PayslipListResponseType>[] = [
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
      width: 80,
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
          </div>
        );
      },
    },
  ];

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <span className='text-xl font-medium tracking-tight text-foreground'>Payslip</span>
        <span className='text-sm text-muted-foreground'>
          {loading ? 'Loading...' : `${data.totalRecords} record${data.totalRecords !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0 pb-4'>
        {data.results.length > 0 ? (
          <DataTableSimple<PayslipListResponseType>
            tableKey='emp-payslip-table'
            rowData={data.results}
            colDefs={colDefs}
            pagination={{
              page: data.page,
              pageSize: data.limit,
              total: data.totalRecords,
            }}
          />
        ) : (
          <p className='py-4 text-sm text-muted-foreground'>No payslip records found.</p>
        )}
      </div>

      <PayslipViewDrawer
        open={viewPayslipId != null}
        onOpenChange={(open) => {
          if (!open) setViewPayslipId(null);
        }}
        payslipId={viewPayslipId}
      />
    </div>
  );
}

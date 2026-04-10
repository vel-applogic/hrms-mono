'use client';

import type { ReimbursementResponseType, PaginatedResponseType } from '@repo/dto';
import { ReimbursementStatusDtoEnum } from '@repo/dto';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { ColDef } from 'ag-grid-community';
import { CheckCircle, DollarSign, Eye, ThumbsDown } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { updateReimbursementStatus } from '@/lib/action/reimbursement.actions';

interface Props {
  data: PaginatedResponseType<ReimbursementResponseType>;
  isAdmin: boolean;
  onView: (reimbursement: ReimbursementResponseType) => void;
  onRefresh: () => void;
}

function getActions(isAdmin: boolean, reimbursement: ReimbursementResponseType): ActionOption[] {
  const actions: ActionOption[] = [
    { name: 'View', icon: Eye, variant: 'outline' },
  ];
  if (isAdmin) {
    if (reimbursement.status === ReimbursementStatusDtoEnum.pending) {
      actions.push({ name: 'Approve', icon: CheckCircle, variant: 'outline' });
      actions.push({ name: 'Reject', icon: ThumbsDown, variant: 'outline-danger' });
    }
    if (reimbursement.status === ReimbursementStatusDtoEnum.approved) {
      actions.push({ name: 'Mark Paid', icon: DollarSign, variant: 'outline' });
    }
  }
  return actions;
}

function ReimbursementActionsCellRenderer(props: {
  data?: ReimbursementResponseType;
  context?: { onClickActions: (action: string, data: ReimbursementResponseType) => void };
  isAdmin?: boolean;
}) {
  const { data, context, isAdmin } = props;
  if (!data || !context) return <span className='text-muted-foreground'>—</span>;
  const options = getActions(isAdmin ?? false, data);
  if (options.length === 0) return <span className='text-muted-foreground'>—</span>;
  return <ActionsIconCellRenderer<ReimbursementResponseType> data={data} context={context} options={options} />;
}

const statusColorMap: Record<ReimbursementStatusDtoEnum, string> = {
  [ReimbursementStatusDtoEnum.pending]: 'bg-yellow-500/20 text-yellow-600',
  [ReimbursementStatusDtoEnum.approved]: 'bg-blue-500/20 text-blue-600',
  [ReimbursementStatusDtoEnum.paid]: 'bg-green-500/20 text-green-600',
  [ReimbursementStatusDtoEnum.rejected]: 'bg-red-500/20 text-red-600',
};

type ConfirmAction = 'approve' | 'reject' | 'markPaid';

export const ReimbursementDataTable = ({ data, isAdmin, onView, onRefresh }: Props) => {
  const [confirmModal, setConfirmModal] = useState<{ action: ConfirmAction; reimbursement: ReimbursementResponseType } | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirm = useCallback(async () => {
    if (!confirmModal) return;
    const { action, reimbursement } = confirmModal;
    setLoading(true);
    try {
      switch (action) {
        case 'approve':
          await updateReimbursementStatus(reimbursement.id, { status: ReimbursementStatusDtoEnum.approved });
          break;
        case 'reject':
          await updateReimbursementStatus(reimbursement.id, { status: ReimbursementStatusDtoEnum.rejected, rejectReason });
          break;
        case 'markPaid':
          await updateReimbursementStatus(reimbursement.id, { status: ReimbursementStatusDtoEnum.paid });
          break;
      }
      onRefresh();
    } catch {
      // Error handled by service
    } finally {
      setConfirmModal(null);
      setRejectReason('');
      setLoading(false);
    }
  }, [confirmModal, rejectReason, onRefresh]);

  const colDefs = useMemo<ColDef<ReimbursementResponseType>[]>(
    () => [
      { headerName: '#', field: 'id', width: 70 },
      {
        headerName: 'Employee',
        flex: 1.5,
        valueGetter: (params) => (params.data ? `${params.data.user.firstname} ${params.data.user.lastname}` : ''),
      },
      { headerName: 'Title', field: 'title', flex: 2 },
      {
        headerName: 'Amount',
        field: 'amount',
        width: 120,
        valueFormatter: (params) => (params.value != null ? `${Number(params.value).toLocaleString()}` : ''),
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 120,
        cellRenderer: (params: { value?: ReimbursementStatusDtoEnum }) => {
          if (!params.value) return null;
          const label = params.value.charAt(0).toUpperCase() + params.value.slice(1);
          return (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColorMap[params.value] ?? ''}`}>
              {label}
            </span>
          );
        },
      },
      {
        headerName: 'Last Feedback',
        flex: 2,
        valueGetter: (params) => {
          const fb = params.data?.lastFeedback;
          if (!fb) return '';
          return fb.message;
        },
      },
      {
        headerName: 'Created',
        field: 'createdAt',
        width: 110,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString() : ''),
      },
      {
        headerName: 'Actions',
        colId: 'actions',
        sortable: false,
        resizable: false,
        pinned: 'right',
        width: 160,
        cellClass: '!flex items-center !justify-center',
        cellRenderer: ReimbursementActionsCellRenderer,
        cellRendererParams: { isAdmin },
      },
    ],
    [isAdmin],
  );

  const onActionClick = useCallback(
    (action: string, actionData: ReimbursementResponseType) => {
      switch (action) {
        case 'View':
          onView(actionData);
          break;
        case 'Approve':
          setConfirmModal({ action: 'approve', reimbursement: actionData });
          break;
        case 'Reject':
          setRejectReason('');
          setConfirmModal({ action: 'reject', reimbursement: actionData });
          break;
        case 'Mark Paid':
          setConfirmModal({ action: 'markPaid', reimbursement: actionData });
          break;
      }
    },
    [onView],
  );

  return (
    <>
      <DataTableSimple<ReimbursementResponseType>
        colDefs={colDefs}
        onActionClick={onActionClick}
        pagination={{
          page: data.page,
          pageSize: data.limit,
          total: data.totalRecords,
        }}
        rowData={data.results}
        tableKey='reimbursement-table'
      />
      {confirmModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='relative w-[400px] rounded-lg border border-border bg-background p-6 shadow-lg'>
            <div className='mb-4'>
              <p className='text-sm font-medium text-foreground'>
                {confirmModal.action === 'approve' && 'Approve this reimbursement request?'}
                {confirmModal.action === 'reject' && 'Reject this reimbursement request?'}
                {confirmModal.action === 'markPaid' && 'Mark this reimbursement as paid?'}
              </p>
              <p className='mt-1 text-sm text-muted-foreground'>
                {confirmModal.reimbursement.title} - {confirmModal.reimbursement.amount.toLocaleString()}
              </p>
            </div>
            {confirmModal.action === 'reject' && (
              <div className='mb-4'>
                <label className='mb-1 block text-xs text-muted-foreground'>Reject reason (required)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                  rows={3}
                  placeholder='Enter reason for rejection...'
                />
              </div>
            )}
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => { setConfirmModal(null); setRejectReason(''); }}
                disabled={loading}
                className='rounded border border-border px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleConfirm}
                disabled={loading || (confirmModal.action === 'reject' && !rejectReason.trim())}
                className={`rounded px-4 py-2 text-sm text-white disabled:opacity-50 ${
                  confirmModal.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {loading
                  ? 'Processing...'
                  : confirmModal.action === 'approve'
                    ? 'Yes, approve'
                    : confirmModal.action === 'reject'
                      ? 'Yes, reject'
                      : 'Yes, mark paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

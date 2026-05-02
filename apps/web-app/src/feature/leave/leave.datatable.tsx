'use client';

import {
  LeaveDayHalfDtoEnum,
  LeaveResponseType,
  LeaveStatusDtoEnum,
  PaginatedResponseType,
} from '@repo/dto';
import { DataTableMultiSelect, DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { Button } from '@repo/ui/component/ui/button';
import { ColDef } from 'ag-grid-community';
import { CheckCircle, Eye, Pencil, ThumbsDown, X, XCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { approveLeave, cancelLeave, rejectLeave } from '@/lib/action/leave.actions';

interface Props {
  data: PaginatedResponseType<LeaveResponseType>;
  currentUserId: number | null;
  isAdmin?: boolean;
  hideEmployeeColumn?: boolean;
  enableBulkApprove?: boolean;
  onEdit: (leave: LeaveResponseType) => void;
  onView?: (leave: LeaveResponseType) => void;
  onRefresh?: () => void;
  autoHeight?: boolean;
}

function getActions(
  currentUserId: number | null,
  isAdmin: boolean,
  leave: LeaveResponseType,
  onView?: (leave: LeaveResponseType) => void,
): ActionOption[] {
  const actions: ActionOption[] = [];
  if (onView) {
    actions.push({ name: 'View', icon: Eye, variant: 'outline' });
  }
  if (isAdmin && leave.status !== 'approved') {
    actions.push({ name: 'Approve', icon: CheckCircle, variant: 'outline' });
  }
  if (isAdmin && leave.status !== 'rejected') {
    actions.push({ name: 'Reject', icon: ThumbsDown, variant: 'outline-danger' });
  }
  if (leave.status !== 'cancelled' && (isAdmin || (leave.status === 'pending' && currentUserId && leave.userId === currentUserId))) {
    actions.push({ name: 'Cancel', icon: XCircle, variant: 'outline-danger' });
  }
  if (leave.status === 'pending' && currentUserId && leave.userId === currentUserId) {
    actions.push({ name: 'Edit', icon: Pencil, variant: 'outline' });
  }
  return actions;
}

function LeaveActionsCellRenderer(
  props: {
    data?: LeaveResponseType;
    context?: { onClickActions: (action: string, data: LeaveResponseType) => void };
    currentUserId?: number | null;
    isAdmin?: boolean;
    onView?: (leave: LeaveResponseType) => void;
  },
) {
  const { data, context, currentUserId, isAdmin, onView } = props;
  if (!data || !context) return <span className='text-muted-foreground'>—</span>;
  const options = getActions(currentUserId ?? null, isAdmin ?? false, data, onView);
  if (options.length === 0) return <span className='text-muted-foreground'>—</span>;
  return (
    <ActionsIconCellRenderer<LeaveResponseType>
      data={data}
      context={context}
      options={options}
    />
  );
}

type ConfirmAction = 'approve' | 'reject' | 'cancel';

export const LeaveDataTableClient = (props: Props) => {
  const [confirmModal, setConfirmModal] = useState<{ action: ConfirmAction; leave: LeaveResponseType } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const selectablePendingIds = useMemo(
    () => props.data.results.filter((l) => l.status === LeaveStatusDtoEnum.pending).map((l) => l.id),
    [props.data.results],
  );

  const selectedPendingIds = useMemo(
    () => selectedIds.filter((id) => selectablePendingIds.includes(id)),
    [selectedIds, selectablePendingIds],
  );

  const closeBulkConfirm = useCallback(() => {
    if (!bulkLoading) setBulkConfirmOpen(false);
  }, [bulkLoading]);

  const handleBulkApprove = useCallback(async () => {
    if (selectedPendingIds.length === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(selectedPendingIds.map((id) => approveLeave(id)));
      setSelectedIds([]);
      props.onRefresh?.();
    } catch {
      // Error handled by leave service
    } finally {
      setBulkConfirmOpen(false);
      setBulkLoading(false);
    }
  }, [selectedPendingIds, props]);

  const openConfirm = useCallback((action: ConfirmAction, leave: LeaveResponseType) => {
    setConfirmModal({ action, leave });
  }, []);

  const closeConfirm = useCallback(() => {
    if (!loading) {
      setConfirmModal(null);
    }
  }, [loading]);

  const handleConfirm = useCallback(async () => {
    if (!confirmModal) return;
    const { action, leave } = confirmModal;
    setLoading(true);
    try {
      switch (action) {
        case 'approve':
          await approveLeave(leave.id);
          break;
        case 'reject':
          await rejectLeave(leave.id);
          break;
        case 'cancel':
          await cancelLeave(leave.id);
          break;
      }
      props.onRefresh?.();
    } catch {
      // Error handled by leave service
    } finally {
      setConfirmModal(null);
      setLoading(false);
    }
  }, [confirmModal, props]);

  const colDefs = useMemo<ColDef<LeaveResponseType>[]>(() => {
    const cols: ColDef<LeaveResponseType>[] = [
      {
        headerName: 'Id',
        field: 'id',
        width: 80,
      },
    ];

    if (!props.hideEmployeeColumn) {
      cols.push(
        {
          headerName: 'Employee',
          flex: 2,
          valueGetter: (params) =>
            params.data ? `${params.data.user.firstname} ${params.data.user.lastname}` : '',
        },
        {
          headerName: 'Email',
          field: 'user.email',
          flex: 2,
          valueGetter: (params) => params.data?.user?.email ?? '',
        },
      );
    }

    cols.push(
      {
        headerName: 'Type',
        field: 'leaveType',
        width: 100,
        valueFormatter: (params) =>
          params.value ? String(params.value).replace(/([A-Z])/g, ' $1').trim() : '',
      },
      {
        headerName: 'Date',
        colId: 'date',
        width: 240,
        valueGetter: (params) => {
          if (!params.data) return '';
          const { startDate, endDate, startDuration, endDuration } = params.data;
          const halfLabel = (h: LeaveDayHalfDtoEnum) => (h === LeaveDayHalfDtoEnum.firstHalf ? ' (1st half)' : h === LeaveDayHalfDtoEnum.secondHalf ? ' (2nd half)' : '');
          if (startDate === endDate) {
            return `${startDate}${halfLabel(startDuration)}`;
          }
          return `${startDate}${halfLabel(startDuration)} – ${endDate}${halfLabel(endDuration)}`;
        },
      },
      {
        headerName: 'Days',
        field: 'numberOfDays',
        width: 80,
      },
      {
        headerName: 'Reason',
        field: 'reason',
        flex: 2,
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 110,
        valueFormatter: (params) =>
          params.value ? String(params.value).replace(/([A-Z])/g, ' $1').trim() : '',
      },
      {
        headerName: 'Actions',
        colId: 'actions',
        sortable: false,
        resizable: false,
        pinned: 'right',
        width: 180,
        cellClass: '!flex items-center !justify-center',
        cellRenderer: LeaveActionsCellRenderer,
        cellRendererParams: {
          currentUserId: props.currentUserId,
          isAdmin: props.isAdmin,
          onView: props.onView,
        },
      },
    );

    return cols;
  }, [props.currentUserId, props.isAdmin, props.onView, props.hideEmployeeColumn]);

  const getConfirmContent = (action: ConfirmAction, leave: LeaveResponseType) => {
    const name = `${leave.user.firstname} ${leave.user.lastname}`;
    const halfLabel = (h: LeaveDayHalfDtoEnum) => (h === LeaveDayHalfDtoEnum.firstHalf ? ' (1st half)' : h === LeaveDayHalfDtoEnum.secondHalf ? ' (2nd half)' : '');
    const period = leave.startDate === leave.endDate
      ? `${leave.startDate}${halfLabel(leave.startDuration)}`
      : `${leave.startDate}${halfLabel(leave.startDuration)} – ${leave.endDate}${halfLabel(leave.endDuration)}`;
    let title = '';
    switch (action) {
      case 'approve':
        title = `Approve leave request for ${name} ?`;
        break;
      case 'reject':
        title = `Reject leave request for ${name} ?`;
        break;
      case 'cancel':
        title = `Cancel leave request for ${name} ?`;
        break;
    }
    return { title, period };
  };

  const getConfirmButtonText = (action: ConfirmAction) => {
    switch (action) {
      case 'approve':
        return loading ? 'Approving...' : 'Yes, approve';
      case 'reject':
        return loading ? 'Rejecting...' : 'Yes, reject';
      case 'cancel':
        return loading ? 'Cancelling...' : 'Yes, cancel';
    }
  };

  const onActionClick = useCallback(
    (action: string, data: LeaveResponseType) => {
      switch (action) {
        case 'View':
          props.onView?.(data);
          break;
        case 'Approve':
          openConfirm('approve', data);
          break;
        case 'Reject':
          openConfirm('reject', data);
          break;
        case 'Edit':
          props.onEdit(data);
          break;
        case 'Cancel':
          openConfirm('cancel', data);
          break;
      }
    },
    [props, openConfirm],
  );

  const paginationProps = {
    page: props.data.page,
    pageSize: props.data.limit,
    total: props.data.totalRecords,
  };

  return (
    <>
      {props.enableBulkApprove ? (
        <div className='flex h-full flex-col gap-3'>
          <div className='flex items-center justify-end gap-3'>
            <span className='text-sm text-muted-foreground'>
              {selectedPendingIds.length} selected
            </span>
            <Button
              size='sm'
              disabled={selectedPendingIds.length === 0}
              onClick={() => setBulkConfirmOpen(true)}
            >
              <CheckCircle className='h-4 w-4' />
              Approve selected
            </Button>
          </div>
          <div className='min-h-0 flex-1'>
            <DataTableMultiSelect<LeaveResponseType>
              colDefs={colDefs}
              onActionClick={onActionClick}
              autoHeight={props.autoHeight}
              pagination={paginationProps}
              rowData={props.data.results}
              tableKey='leave-approval-table'
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              rowSelectionOptions={{
                mode: 'multiRow',
                headerCheckbox: true,
                isRowSelectable: (node) => node.data?.status === LeaveStatusDtoEnum.pending,
              }}
            />
          </div>
        </div>
      ) : (
        <DataTableSimple<LeaveResponseType>
          colDefs={colDefs}
          onActionClick={onActionClick}
          autoHeight={props.autoHeight}
          pagination={paginationProps}
          rowData={props.data.results}
          tableKey='leave-table'
        />
      )}
      {bulkConfirmOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='relative rounded-lg border border-border bg-background p-6 shadow-lg'>
            <button
              type='button'
              onClick={closeBulkConfirm}
              disabled={bulkLoading}
              className='absolute right-4 top-4 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
              aria-label='Close'
            >
              <X className='h-4 w-4' />
            </button>
            <div className='mb-4 pr-8'>
              <p className='text-sm text-foreground'>
                Approve {selectedPendingIds.length} leave request{selectedPendingIds.length === 1 ? '' : 's'}?
              </p>
            </div>
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={closeBulkConfirm}
                disabled={bulkLoading}
                className='rounded border border-border px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50'
              >
                No
              </button>
              <button
                type='button'
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className='rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50'
              >
                {bulkLoading ? 'Approving...' : 'Yes, approve'}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='relative rounded-lg border border-border bg-background p-6 shadow-lg'>
            <button
              type='button'
              onClick={closeConfirm}
              disabled={loading}
              className='absolute right-4 top-4 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
              aria-label='Close'
            >
              <X className='h-4 w-4' />
            </button>
            {(() => {
              const { title, period } = getConfirmContent(confirmModal.action, confirmModal.leave);
              return (
                <div className='mb-4 pr-8'>
                  <p className='text-sm text-foreground'>{title}</p>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Period: <span className='font-medium text-foreground'>{period}</span>
                  </p>
                </div>
              );
            })()}
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={closeConfirm}
                disabled={loading}
                className='rounded border border-border px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50'
              >
                No
              </button>
              <button
                type='button'
                onClick={handleConfirm}
                disabled={loading}
                className={`rounded px-4 py-2 text-sm text-white disabled:opacity-50 ${
                  confirmModal.action === 'approve'
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-destructive hover:bg-destructive/90'
                }`}
              >
                {getConfirmButtonText(confirmModal.action)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

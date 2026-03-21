'use client';

import {
  LeaveResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { ColDef } from 'ag-grid-community';
import { CheckCircle, Eye, Pencil, ThumbsDown, X, XCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { approveLeave, cancelLeave, rejectLeave } from '@/lib/action/leave.actions';

interface Props {
  data: PaginatedResponseType<LeaveResponseType>;
  currentUserId: number | null;
  isAdmin?: boolean;
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
  if (leave.status !== 'approved') {
    actions.push({ name: 'Approve', icon: CheckCircle, variant: 'outline' });
  }
  if (leave.status !== 'rejected') {
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
    return [
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
        field: 'user.email',
        flex: 2,
        valueGetter: (params) => params.data?.user?.email ?? '',
      },
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
        width: 180,
        valueGetter: (params) => {
          if (!params.data) return '';
          const { startDate, endDate } = params.data;
          return startDate === endDate ? startDate : `${startDate} – ${endDate}`;
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
    ] satisfies ColDef<LeaveResponseType>[];
  }, [props.currentUserId, props.isAdmin, props.onView]);

  const getConfirmMessage = (action: ConfirmAction, leave: LeaveResponseType) => {
    const name = `${leave.user.firstname} ${leave.user.lastname}`;
    const dates = leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} – ${leave.endDate}`;
    switch (action) {
      case 'approve':
        return `Approve leave request for ${name} (${dates})?`;
      case 'reject':
        return `Reject leave request for ${name} (${dates})?`;
      case 'cancel':
        return `Cancel leave request for ${name} (${dates})?`;
    }
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

  return (
    <>
      <DataTableSimple<LeaveResponseType>
        colDefs={colDefs}
        onActionClick={onActionClick}
        autoHeight={props.autoHeight}
        pagination={{
          page: props.data.page,
          pageSize: props.data.limit,
          total: props.data.totalRecords,
        }}
        rowData={props.data.results}
        tableKey='leave-table'
      />
      {confirmModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='relative rounded-lg border border-border bg-background p-6 shadow-lg'>
            <button
              type='button'
              onClick={closeConfirm}
              disabled={loading}
              className='absolute right-4 top-4 rounded p-1 text-muted-foreground hover:bg-muted hover:text-white disabled:opacity-50'
              aria-label='Close'
            >
              <X className='h-4 w-4' />
            </button>
            <p className='mb-4 pr-8 text-sm text-white'>
              {getConfirmMessage(confirmModal.action, confirmModal.leave)}
            </p>
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={closeConfirm}
                disabled={loading}
                className='rounded border border-border px-4 py-2 text-sm text-white hover:bg-muted disabled:opacity-50'
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

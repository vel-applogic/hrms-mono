'use client';

import { AdminUserListResponseType, AdminUsersSortableColumns, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, BadgeRenderer, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef, RowClassParams } from 'ag-grid-community';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

interface Props {
  data: PaginatedResponseType<AdminUserListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  onEdit: (user: AdminUserListResponseType) => void;
  onDelete: (user: AdminUserListResponseType) => void;
  additionalActions?: ActionOption[];
  onAdditionalActionClick?: (action: string, data: AdminUserListResponseType) => void;
}

export const UserDataTableClient = (props: Props) => {
  const colDefs = useMemo<ColDef<AdminUserListResponseType>[]>(() => {
    const standardActions: ActionOption[] = [
      { name: 'Edit', icon: Pencil },
      { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
    ];
    const actionsToShow = props.additionalActions ? [...standardActions, ...props.additionalActions] : standardActions;
    const visibleSlots = Math.max(actionsToShow.length, 1);

    return [
      {
        headerName: 'Id',
        field: 'id',
        sort: getSort('id', props.sort.sKey, props.sort.sVal),
        sortable: false,
        comparator: DummySort,
        width: 80,
      },
      {
        headerName: 'Firstname',
        field: 'firstname',
        flex: 1,
        sort: getSort('firstname', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('firstname', AdminUsersSortableColumns),
        comparator: DummySort,
        cellRenderer: (params: { value: string }) =>
          params.value ? params.value : <span className='text-muted-foreground text-xs italic'>Pending</span>,
      },
      {
        headerName: 'Lastname',
        field: 'lastname',
        flex: 1,
        sort: getSort('lastname', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('lastname', AdminUsersSortableColumns),
        comparator: DummySort,
        cellRenderer: (params: { value: string }) =>
          params.value ? params.value : <span className='text-muted-foreground text-xs italic'>Pending</span>,
      },
      {
        headerName: 'Email',
        field: 'email',
        flex: 1,
        sort: getSort('email', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('email', AdminUsersSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Roles',
        field: 'roles',
        flex: 1,
        sortable: false,
        cellRenderer: (params: { value: string[] }) => (
          <div className='flex flex-wrap gap-1 items-center h-full'>
            {params.value?.length ? (
              params.value.map((role) => (
                <span
                  key={role}
                  className={
                    role === 'admin'
                      ? 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-primary/15 text-primary'
                      : 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground'
                  }
                >
                  {role}
                </span>
              ))
            ) : (
              <span className='text-xs text-muted-foreground'>—</span>
            )}
          </div>
        ),
      },
      {
        headerName: 'Status',
        field: 'isActive',
        flex: 1,
        sort: getSort('isActive', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('isActive', AdminUsersSortableColumns),
        comparator: DummySort,
        cellRenderer: (params: { value: boolean }) =>
          BadgeRenderer({
            text: params.value ? 'Active' : 'Inactive',
            className: params.value ? 'bg-online/20 text-online' : 'bg-destructive/20 text-destructive',
          }),
      },
      {
        headerName: 'Joined At',
        field: 'createdAt',
        minWidth: 200,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Actions',
        colId: 'actions',
        sortable: false,
        resizable: false,
        pinned: 'right',
        width: 20 + visibleSlots * 40,
        cellClass: '!flex items-center !justify-center',
        cellRenderer: ActionsIconCellRenderer<AdminUserListResponseType>,
        cellRendererParams: (cellParams: { data: AdminUserListResponseType }) => ({
          options: actionsToShow,
        }) satisfies Partial<ActionsIconCellRendererParams<AdminUserListResponseType>>,
      },
    ] satisfies ColDef<AdminUserListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal, props.additionalActions]);

  const onActionClick = useCallback(
    (action: string, data: AdminUserListResponseType) => {
      if (action === 'Edit') {
        props.onEdit(data);
      } else if (action === 'Delete') {
        props.onDelete(data);
      } else if (props.onAdditionalActionClick) {
        props.onAdditionalActionClick(action, data);
      }
    },
    [props],
  );

  const getRowClass = useCallback((params: RowClassParams<AdminUserListResponseType>) => {
    return `user-row-${params.data?.id}`;
  }, []);

  return (
    <DataTableSimple<AdminUserListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      getRowClass={getRowClass}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='user-table'
    />
  );
};

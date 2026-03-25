'use client';

import { AdminUserListResponseType, AdminUsersSortableColumns, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, BadgeRenderer, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef, RowClassParams } from 'ag-grid-community';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

interface Props {
  data: PaginatedResponseType<AdminUserListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  additionalActions?: ActionOption[];
  onAdditionalActionClick?: (action: string, data: AdminUserListResponseType) => void;
}

export const UserDataTableClient = (props: Props) => {
  const router = useRouter();
  const [detailDrawer, setDetailDrawer] = useState<{ open: boolean; userId?: number }>({ open: false });

  const colDefs = useMemo<ColDef<AdminUserListResponseType>[]>(() => {
    const standardActions: ActionOption[] = [];
    const actionsToShow = props.additionalActions ? [...standardActions, ...props.additionalActions] : standardActions;
    const visibleSlots = Math.max(actionsToShow.length, 1);

    return [
      {
        headerName: 'Id',
        field: 'id',
        sort: getSort('id', props.sort.sKey, props.sort.sVal),
        sortable: false,
        comparator: DummySort,
        width: 100,
      },
      {
        headerName: 'Firstname',
        field: 'firstname',
        flex: 1,
        sort: getSort('firstname', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('firstname', AdminUsersSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Lastname',
        field: 'lastname',
        flex: 1,
        sort: getSort('lastname', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('lastname', AdminUsersSortableColumns),
        comparator: DummySort,
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
          <div className="flex flex-wrap gap-1 items-center h-full">
            {params.value?.length
              ? params.value.map((role) => (
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
              : <span className="text-xs text-muted-foreground">—</span>}
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
      switch (action) {
        case 'Details':
          router.push(`/admin/user/${data.id}/detail`);
          break;
        case 'Edit':
          router.push(`/admin/user/${data.id}/edit`);
          break;
        default:
          if (props.onAdditionalActionClick) {
            props.onAdditionalActionClick(action, data);
          }
          break;
      }
    },
    [router, props.onAdditionalActionClick],
  );

  const onCellClick = useCallback((data: AdminUserListResponseType) => {
    setDetailDrawer({ open: true, userId: data.id });
  }, []);

  const getRowClass = useCallback((params: RowClassParams<AdminUserListResponseType>) => {
    return `user-row-${params.data?.id}`;
  }, []);

  return (
    <>
      {detailDrawer.userId && detailDrawer.open && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .user-row-${CSS.escape(detailDrawer.userId.toString())} {
                background-color: var(--row-highlight) !important;
              }
            `,
          }}
        />
      )}
      <DataTableSimple<AdminUserListResponseType>
        colDefs={colDefs}
        onActionClick={onActionClick}
        onCellClick={onCellClick}
        getRowClass={getRowClass}
        pagination={{
          page: props.data.page,
          pageSize: props.data.limit,
          total: props.data.totalRecords,
        }}
        rowData={props.data.results}
        tableKey='user-table'
      />
    </>
  );
};

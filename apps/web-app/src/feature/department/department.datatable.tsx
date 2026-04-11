'use client';

import type { DepartmentResponseType, PaginatedResponseType } from '@repo/dto';
import { DepartmentSortableColumns } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

interface Props {
  data: PaginatedResponseType<DepartmentResponseType>;
  sort: { sKey?: string; sVal?: string };
  onEdit: (department: DepartmentResponseType) => void;
  onDelete: (department: DepartmentResponseType) => void;
  onRefresh: () => void;
}

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const DepartmentDataTableClient = (props: Props) => {
  const colDefs = useMemo<ColDef<DepartmentResponseType>[]>(() => {
    return [
      {
        headerName: 'Id',
        field: 'id',
        sortable: false,
        width: 80,
      },
      {
        headerName: 'Name',
        field: 'name',
        flex: 1,
        sort: getSort('name', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('name', DepartmentSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', DepartmentSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 200,
        sort: getSort('updatedAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('updatedAt', DepartmentSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Actions',
        colId: 'actions',
        sortable: false,
        resizable: false,
        pinned: 'right',
        width: 20 + actionOptions.length * 40,
        cellClass: '!flex items-center !justify-center',
        cellRenderer: ActionsIconCellRenderer<DepartmentResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<DepartmentResponseType>>,
      },
    ] satisfies ColDef<DepartmentResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    (action: string, data: DepartmentResponseType) => {
      switch (action) {
        case 'Edit':
          props.onEdit(data);
          break;
        case 'Delete':
          props.onDelete(data);
          break;
      }
    },
    [props],
  );

  return (
    <DataTableSimple<DepartmentResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='department-table'
    />
  );
};

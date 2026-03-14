'use client';

import { PaginatedResponseType, ThemeListResponseType, ThemeSortableColumns } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

interface Props {
  data: PaginatedResponseType<ThemeListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  onEdit: (theme: ThemeListResponseType) => void;
  onDelete: (theme: ThemeListResponseType) => void;
}

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const ThemeDataTableClient = (props: Props) => {
  const colDefs = useMemo<ColDef<ThemeListResponseType>[]>(() => {
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
        headerName: 'Title',
        field: 'title',
        flex: 2,
        sort: getSort('title', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('title', ThemeSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Description',
        field: 'description',
        flex: 3,
        sort: getSort('description', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('description', ThemeSortableColumns),
        comparator: DummySort,
        valueFormatter: (params) => params.value ?? '—',
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', ThemeSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 200,
        sort: getSort('updatedAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('updatedAt', ThemeSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<ThemeListResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<ThemeListResponseType>>,
      },
    ] satisfies ColDef<ThemeListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    (action: string, data: ThemeListResponseType) => {
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
    <DataTableSimple<ThemeListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='theme-table'
    />
  );
};

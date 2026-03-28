'use client';

import {
  OrganizationResponseType,
  OrganizationSortableColumns,
  PaginatedResponseType,
} from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

interface Props {
  data: PaginatedResponseType<OrganizationResponseType>;
  sort: { sKey?: string; sVal?: string };
  onView: (organization: OrganizationResponseType) => void;
  onEdit: (organization: OrganizationResponseType) => void;
  onDelete: (organization: OrganizationResponseType) => void;
}

const actionOptions: ActionOption[] = [
  { name: 'View', icon: Eye, variant: 'outline' },
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const OrganizationDataTableClient = (props: Props) => {
  const colDefs = useMemo<ColDef<OrganizationResponseType>[]>(() => {
    return [
      {
        headerName: 'Id',
        field: 'id',
        sortable: false,
        comparator: DummySort,
        width: 80,
      },
      {
        headerName: 'Name',
        field: 'name',
        flex: 3,
        sort: getSort('name', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('name', OrganizationSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', OrganizationSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 200,
        sort: getSort('updatedAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('updatedAt', OrganizationSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<OrganizationResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<OrganizationResponseType>>,
      },
    ] satisfies ColDef<OrganizationResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    (action: string, data: OrganizationResponseType) => {
      switch (action) {
        case 'View':
          props.onView(data);
          break;
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
    <DataTableSimple<OrganizationResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='organization-table'
    />
  );
};

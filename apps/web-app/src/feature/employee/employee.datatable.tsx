'use client';

import {
  EmployeeListResponseType,
  EmployeeSortableColumns,
  PaginatedResponseType,
} from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface Props {
  data: PaginatedResponseType<EmployeeListResponseType>;
  sort: { sKey?: string; sVal?: string };
  onEdit: (employee: EmployeeListResponseType) => void;
  onDelete: (employee: EmployeeListResponseType) => void;
  onRefresh?: () => void;
}

const actionOptions: ActionOption[] = [
  { name: 'View', icon: Eye, variant: 'outline' },
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const EmployeeDataTableClient = (props: Props) => {
  const router = useRouter();

  const colDefs = useMemo<ColDef<EmployeeListResponseType>[]>(() => {
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
        headerName: 'Name',
        flex: 2,
        sort: getSort('firstname', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('firstname', EmployeeSortableColumns),
        comparator: DummySort,
        valueGetter: (params) => params.data ? `${params.data.firstname} ${params.data.lastname}` : '',
      },
      {
        headerName: 'Email',
        field: 'email',
        flex: 2,
        sort: getSort('email', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('email', EmployeeSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Designation',
        field: 'designation',
        flex: 2,
        sort: getSort('designation', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('designation', EmployeeSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 130,
        sort: getSort('status', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('status', EmployeeSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Date of Joining',
        field: 'dateOfJoining',
        width: 140,
        sort: getSort('dateOfJoining', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('dateOfJoining', EmployeeSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', EmployeeSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<EmployeeListResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<EmployeeListResponseType>>,
      },
    ] satisfies ColDef<EmployeeListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    async (action: string, data: EmployeeListResponseType) => {
      switch (action) {
        case 'View':
          router.push(`/employee/${data.id}/details`);
          break;
        case 'Edit':
          props.onEdit(data);
          break;
        case 'Delete':
          props.onDelete(data);
          break;
      }
    },
    [props, router],
  );

  return (
    <DataTableSimple<EmployeeListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='employee-table'
    />
  );
};

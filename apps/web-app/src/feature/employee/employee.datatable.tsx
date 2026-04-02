'use client';

import {
  EmployeeListResponseType,
  EmployeeSortableColumns,
  EmployeeStatusDtoEnum,
  PaginatedResponseType,
} from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, BadgeRenderer, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

const STATUS_BADGE_CLASS: Record<string, string> = {
  [EmployeeStatusDtoEnum.active]: 'bg-success/20 text-success',
  [EmployeeStatusDtoEnum.resigned]: 'bg-warning/20 text-warning',
  [EmployeeStatusDtoEnum.onLeave]: 'bg-blue-500/20 text-blue-500',
  [EmployeeStatusDtoEnum.terminated]: 'bg-destructive/20 text-destructive',
};

const EmployeeStatusRenderer = (props: { value?: string }) => (
  <BadgeRenderer
    text={props.value ?? '-'}
    className={`text-xs ${STATUS_BADGE_CLASS[props.value ?? ''] ?? ''}`}
  />
);

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
        headerName: 'Emp Code',
        field: 'employeeCode',
        sortable: false,
        width: 120,
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
        cellRenderer: EmployeeStatusRenderer,
      },
      {
        headerName: 'BGV',
        field: 'isBgVerified',
        width: 100,
        sortable: false,
        cellRenderer: (params: { value?: boolean }) => (
          <BadgeRenderer
            text={params.value ? 'Pass' : 'Pending'}
            className={`text-xs ${params.value ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}
          />
        ),
      },
      {
        headerName: 'Joining Date',
        field: 'dateOfJoining',
        width: 130,
        sort: getSort('dateOfJoining', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('dateOfJoining', EmployeeSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Relieving Date',
        field: 'dateOfLeaving',
        width: 130,
        sortable: false,
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

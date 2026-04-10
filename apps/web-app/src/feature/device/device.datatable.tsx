'use client';

import { DeviceResponseType, DeviceSortableColumns, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { deviceStatusDtoEnumToReadableLabel, deviceTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

function DeviceTypeCellRenderer({ value }: ICellRendererParams<DeviceResponseType>) {
  if (!value) return null;
  return <span className='text-sm text-foreground'>{deviceTypeDtoEnumToReadableLabel(value)}</span>;
}

function DeviceStatusCellRenderer({ value }: ICellRendererParams<DeviceResponseType>) {
  if (!value) return null;
  return <span className='text-sm text-foreground'>{deviceStatusDtoEnumToReadableLabel(value)}</span>;
}

interface Props {
  data: PaginatedResponseType<DeviceResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  onView?: (device: DeviceResponseType) => void;
  onEdit?: (device: DeviceResponseType) => void;
  onDelete?: (device: DeviceResponseType) => void;
}

export const DeviceDataTableClient = (props: Props) => {
  const actionOptions = useMemo<ActionOption[]>(() => {
    const options: ActionOption[] = [{ name: 'View', icon: Eye, variant: 'outline' }];
    if (props.onEdit) {
      options.push({ name: 'Edit', icon: Pencil, variant: 'outline' });
    }
    if (props.onDelete) options.push({ name: 'Delete', icon: Trash2, variant: 'outline-danger' });
    return options;
  }, [props.onEdit, props.onDelete]);

  const colDefs = useMemo<ColDef<DeviceResponseType>[]>(() => {
    const cols: ColDef<DeviceResponseType>[] = [
      {
        headerName: 'Id',
        field: 'id',
        sortable: false,
        comparator: DummySort,
        width: 80,
      },
      {
        headerName: 'Type',
        field: 'type',
        minWidth: 120,
        sort: getSort('type', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('type', DeviceSortableColumns),
        comparator: DummySort,
        cellRenderer: DeviceTypeCellRenderer,
      },
      {
        headerName: 'Brand',
        field: 'brand',
        minWidth: 120,
        sortable: false,
        comparator: DummySort,
      },
      {
        headerName: 'Model',
        field: 'model',
        flex: 1,
        sort: getSort('model', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('model', DeviceSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Serial Number',
        field: 'serialNumber',
        minWidth: 160,
        sortable: false,
        comparator: DummySort,
      },
      {
        headerName: 'Assigned To',
        colId: 'assignedTo',
        minWidth: 150,
        sortable: false,
        comparator: DummySort,
        valueGetter: (params) => {
          const user = params.data?.assignedTo;
          return user ? `${user.firstname} ${user.lastname}` : '';
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        minWidth: 140,
        sort: getSort('status', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('status', DeviceSortableColumns),
        comparator: DummySort,
        cellRenderer: DeviceStatusCellRenderer,
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', DeviceSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
    ];

    cols.push({
      headerName: 'Actions',
      colId: 'actions',
      sortable: false,
      resizable: false,
      pinned: 'right',
      width: 20 + actionOptions.length * 40,
      cellClass: '!flex items-center !justify-center',
      cellRenderer: ActionsIconCellRenderer<DeviceResponseType>,
      cellRendererParams: {
        options: actionOptions,
      } satisfies Partial<ActionsIconCellRendererParams<DeviceResponseType>>,
    });

    return cols;
  }, [props.sort.sKey, props.sort.sVal, actionOptions]);

  const onActionClick = useCallback(
    async (action: string, data: DeviceResponseType) => {
      switch (action) {
        case 'View':
          props.onView?.(data);
          break;
        case 'Edit':
          props.onEdit?.(data);
          break;
        case 'Delete':
          props.onDelete?.(data);
          break;
      }
    },
    [props],
  );

  return (
    <DataTableSimple<DeviceResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='device-table'
    />
  );
};

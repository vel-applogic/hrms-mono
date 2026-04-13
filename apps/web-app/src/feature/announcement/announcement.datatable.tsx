'use client';

import type { AnnouncementResponseType, PaginatedResponseType } from '@repo/dto';
import { AnnouncementSortableColumns } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

function BooleanRenderer({ value }: ICellRendererParams<AnnouncementResponseType>) {
  return <span className='text-sm'>{value ? 'Yes' : 'No'}</span>;
}

function BranchDepartmentRenderer({ data }: ICellRendererParams<AnnouncementResponseType>) {
  const parts: string[] = [];
  if (data?.branch) parts.push(data.branch.name);
  if (data?.department) parts.push(data.department.name);
  return <span className='text-sm text-foreground'>{parts.length > 0 ? parts.join(' / ') : 'All'}</span>;
}

interface Props {
  data: PaginatedResponseType<AnnouncementResponseType>;
  sort: { sKey?: string; sVal?: string };
  onView?: (announcement: AnnouncementResponseType) => void;
  onEdit?: (announcement: AnnouncementResponseType) => void;
  onDelete?: (announcement: AnnouncementResponseType) => void;
}

export function AnnouncementDataTableClient(props: Props) {

  const actionOptions = useMemo<ActionOption[]>(() => {
    const options: ActionOption[] = [{ name: 'View', icon: Eye, variant: 'outline' }];
    if (props.onEdit) options.push({ name: 'Edit', icon: Pencil, variant: 'outline' });
    if (props.onDelete) options.push({ name: 'Delete', icon: Trash2, variant: 'outline-danger' });
    return options;
  }, [props.onEdit, props.onDelete]);

  const colDefs = useMemo<ColDef<AnnouncementResponseType>[]>(() => {
    const cols: ColDef<AnnouncementResponseType>[] = [
      {
        headerName: 'Id',
        field: 'id',
        sortable: false,
        comparator: DummySort,
        width: 80,
      },
      {
        headerName: 'Title',
        field: 'title',
        flex: 1,
        sort: getSort('title', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('title', AnnouncementSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Branch / Department',
        colId: 'branchDepartment',
        sortable: false,
        minWidth: 180,
        cellRenderer: BranchDepartmentRenderer,
      },
      {
        headerName: 'Scheduled At',
        field: 'scheduledAt',
        minWidth: 200,
        sort: getSort('scheduledAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('scheduledAt', AnnouncementSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Published',
        field: 'isPublished',
        width: 110,
        sortable: false,
        cellRenderer: BooleanRenderer,
      },
      {
        headerName: 'Notified',
        field: 'isNotificationSent',
        width: 110,
        sortable: false,
        cellRenderer: BooleanRenderer,
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', AnnouncementSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<AnnouncementResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<AnnouncementResponseType>>,
      },
    ];
    return cols;
  }, [props.sort.sKey, props.sort.sVal, actionOptions]);

  const onActionClick = useCallback(
    (action: string, data: AnnouncementResponseType) => {
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
    <DataTableSimple<AnnouncementResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='announcement-table'
    />
  );
}

'use client';

import { PaginatedResponseType, PolicyDetailResponseType, PolicyListResponseType, PolicySortableColumns } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';


function PolicyTitleCellRenderer({ value }: ICellRendererParams<PolicyListResponseType>) {
  if (!value) return null;
  return <span className='text-sm text-foreground'>{value}</span>;
}

interface Props {
  data: PaginatedResponseType<PolicyListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  basePath?: string;
  onEdit?: (policy: PolicyDetailResponseType) => void;
  onDelete?: (policy: PolicyListResponseType) => void;
}

export const PolicyDataTableClient = (props: Props) => {
  const router = useRouter();
  const actionOptions = useMemo<ActionOption[]>(() => {
    const options: ActionOption[] = [{ name: 'View', icon: Eye, variant: 'outline' }];
    if (props.onEdit) {
      options.push({ name: 'Edit', icon: Pencil, variant: 'outline' });
    }
    if (props.onDelete) options.push({ name: 'Delete', icon: Trash2, variant: 'outline-danger' });
    return options;
  }, [props.onEdit, props.onDelete]);

  const colDefs = useMemo<ColDef<PolicyListResponseType>[]>(() => {
    const cols: ColDef<PolicyListResponseType>[] = [
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
        flex: 1,
        sort: getSort('title', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('title', PolicySortableColumns),
        comparator: DummySort,
        cellRenderer: PolicyTitleCellRenderer,
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', PolicySortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 200,
        sort: getSort('updatedAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('updatedAt', PolicySortableColumns),
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
      cellRenderer: ActionsIconCellRenderer<PolicyListResponseType>,
      cellRendererParams: {
        options: actionOptions,
      } satisfies Partial<ActionsIconCellRendererParams<PolicyListResponseType>>,
    });

    return cols;
  }, [props.sort.sKey, props.sort.sVal, actionOptions]);

  const onActionClick = useCallback(
    async (action: string, data: PolicyListResponseType) => {
      switch (action) {
        case 'View':
          router.push(`${props.basePath ?? '/policy'}/${data.id}`);
          break;
        case 'Edit':
          router.push(`/policy/${data.id}/edit`);
          break;
        case 'Delete':
          props.onDelete?.(data);
          break;
      }
    },
    [props, router],
  );

  return (
    <DataTableSimple<PolicyListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='policy-table'
    />
  );
};

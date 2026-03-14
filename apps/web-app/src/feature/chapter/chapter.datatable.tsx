'use client';

import { ChapterListResponseType, ChapterSortableColumns, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, BadgeRenderer, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

interface Props {
  data: PaginatedResponseType<ChapterListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  onEdit: (chapter: ChapterListResponseType) => void;
  onDelete: (chapter: ChapterListResponseType) => void;
}

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const ChapterDataTableClient = (props: Props) => {
  const colDefs = useMemo<ColDef<ChapterListResponseType>[]>(() => {
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
        sortable: isSortable('title', ChapterSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Description',
        field: 'description',
        flex: 3,
        sort: getSort('description', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('description', ChapterSortableColumns),
        comparator: DummySort,
        valueFormatter: (params) => params.value ?? '—',
      },
      {
        headerName: 'Summary Points',
        field: 'summaryPoints',
        flex: 3,
        sortable: false,
        autoHeight: true,
        cellRenderer: (params: { value?: string[] }) =>
          params.value?.length ? (
            <div className="flex flex-wrap items-center gap-2 py-1">
              {params.value.map((point, i) => (
                <BadgeRenderer key={i} text={point} className="border border-border" />
              ))}
            </div>
          ) : (
            '—'
          ),
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', ChapterSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 200,
        sort: getSort('updatedAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('updatedAt', ChapterSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<ChapterListResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<ChapterListResponseType>>,
      },
    ] satisfies ColDef<ChapterListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    async (action: string, data: ChapterListResponseType) => {
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
    <DataTableSimple<ChapterListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='chapter-table'
    />
  );
};


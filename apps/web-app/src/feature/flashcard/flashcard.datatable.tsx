'use client';

import { FlashcardListResponseType, FlashcardSortableColumns, PaginatedResponseType } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

interface Props {
  data: PaginatedResponseType<FlashcardListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  onEdit: (flashcard: FlashcardListResponseType) => void;
  onDelete: (flashcard: FlashcardListResponseType) => void;
}

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const FlashcardDataTableClient = (props: Props) => {
  const colDefs = useMemo<ColDef<FlashcardListResponseType>[]>(() => {
    return [
      {
        headerName: 'Id',
        field: 'id',
        sortable: false,
        comparator: DummySort,
        width: 80,
      },
      {
        headerName: 'Front',
        field: 'contentFront',
        flex: 2,
        sort: getSort('contentFront', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('contentFront', FlashcardSortableColumns),
        comparator: DummySort,
        autoHeight: true,
        cellClass: 'py-2 text-sm text-white',
      },
      {
        headerName: 'Back',
        field: 'contentBack',
        flex: 2,
        sort: getSort('contentBack', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('contentBack', FlashcardSortableColumns),
        comparator: DummySort,
        autoHeight: true,
        cellClass: 'py-2 text-sm text-white',
      },
      {
        headerName: 'Chapter',
        colId: 'chapter',
        flex: 1,
        sortable: false,
        valueGetter: (params) => params.data?.chapter.title,
      },
      {
        headerName: 'Topic',
        colId: 'topic',
        flex: 1,
        sortable: false,
        valueGetter: (params) => params.data?.topic.title,
      },
      {
        headerName: 'Themes',
        colId: 'themes',
        flex: 1,
        sortable: false,
        valueGetter: (params) => params.data?.themes.map((t) => t.title).join(', ') || '—',
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', FlashcardSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 200,
        sort: getSort('updatedAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('updatedAt', FlashcardSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<FlashcardListResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<FlashcardListResponseType>>,
      },
    ] satisfies ColDef<FlashcardListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    (action: string, data: FlashcardListResponseType) => {
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
    <DataTableSimple<FlashcardListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='flashcard-table'
    />
  );
};

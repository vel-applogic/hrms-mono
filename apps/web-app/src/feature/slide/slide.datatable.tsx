'use client';

import { PaginatedResponseType, SlideDetailResponseType, SlideListResponseType, SlideSortableColumns } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { getSlideById } from '@/lib/action/slide.actions';

function SlideContentCellRenderer({ data }: ICellRendererParams<SlideListResponseType>) {
  if (!data) return null;
  return (
    <div className='flex flex-col gap-2 py-2'>
      <span className='text-sm text-white'>{data.content}</span>
      {data.themes.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {data.themes.map((theme) => (
            <span key={theme.id} className='inline-flex items-center rounded-md border border-border bg-background/10 px-2.5 py-1 text-xs text-white'>
              {theme.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SlideTitleCellRenderer({ value }: ICellRendererParams<SlideListResponseType>) {
  if (!value) return null;
  return <span className='text-sm text-white'>{value}</span>;
}

interface Props {
  data: PaginatedResponseType<SlideListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  onEdit: (slide: SlideDetailResponseType) => void;
  onDelete: (slide: SlideListResponseType) => void;
}

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const SlideDataTableClient = (props: Props) => {
  const colDefs = useMemo<ColDef<SlideListResponseType>[]>(() => {
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
        headerName: 'Content',
        field: 'content',
        flex: 3,
        sort: getSort('content', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('content', SlideSortableColumns),
        comparator: DummySort,
        autoHeight: true,
        cellRenderer: SlideContentCellRenderer,
      },
      {
        headerName: 'Chapter',
        field: 'chapter',
        flex: 1,
        sortable: false,
        valueGetter: ({ data }) => data?.chapter?.title,
        cellRenderer: SlideTitleCellRenderer,
      },
      {
        headerName: 'Topic',
        field: 'topic',
        flex: 1,
        sortable: false,
        valueGetter: ({ data }) => data?.topic?.title,
        cellRenderer: SlideTitleCellRenderer,
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', SlideSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 200,
        sort: getSort('updatedAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('updatedAt', SlideSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<SlideListResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<SlideListResponseType>>,
      },
    ] satisfies ColDef<SlideListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    async (action: string, data: SlideListResponseType) => {
      switch (action) {
        case 'Edit': {
          const slide = await getSlideById(data.id);
          props.onEdit(slide);
          break;
        }
        case 'Delete':
          props.onDelete(data);
          break;
      }
    },
    [props],
  );

  return (
    <DataTableSimple<SlideListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='slide-table'
    />
  );
};

'use client';

import { PaginatedResponseType, TopicDetailResponseType, TopicListResponseType, TopicSortableColumns } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { getTopicById } from '@/lib/action/topic.actions';

interface Props {
  data: PaginatedResponseType<TopicListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  onEdit: (topic: TopicDetailResponseType) => void;
  onDelete: (topic: TopicListResponseType) => void;
}

const actionOptions: ActionOption[] = [
  { name: 'View', icon: Eye, variant: 'outline' },
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const TopicListDataTableClient = (props: Props) => {
  const router = useRouter();

  const colDefs = useMemo<ColDef<TopicListResponseType>[]>(() => {
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
        sortable: isSortable('title', TopicSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Chapter',
        field: 'chapterTitle',
        flex: 2,
        sortable: false,
        comparator: DummySort,
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', TopicSortableColumns),
        comparator: DummySort,
        cellRenderer: DateTimeRenderer,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 200,
        sort: getSort('updatedAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('updatedAt', TopicSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<TopicListResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<TopicListResponseType>>,
      },
    ] satisfies ColDef<TopicListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    async (action: string, data: TopicListResponseType) => {
      switch (action) {
        case 'View':
          router.push(`/chapter/${data.chapterId}/topic/${data.id}`);
          break;
        case 'Edit': {
          const topic = await getTopicById(data.id);
          props.onEdit(topic);
          break;
        }
        case 'Delete':
          props.onDelete(data);
          break;
      }
    },
    [router, props],
  );

  return (
    <DataTableSimple<TopicListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='topic-list-table'
    />
  );
};

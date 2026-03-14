'use client';

import { PaginatedResponseType, QuestionDetailResponseType, QuestionListResponseType, QuestionSortableColumns } from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, ActionsIconCellRendererParams, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { getQuestionById } from '@/lib/action/question.actions';

interface Props {
  data: PaginatedResponseType<QuestionListResponseType>;
  sort: {
    sKey?: string;
    sVal?: string;
  };
  onEdit: (question: QuestionDetailResponseType) => void;
  onDelete: (question: QuestionListResponseType) => void;
}

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

export const QuestionDataTableClient = (props: Props) => {
  const colDefs = useMemo<ColDef<QuestionListResponseType>[]>(() => {
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
        headerName: 'Question',
        field: 'question',
        flex: 3,
        sort: getSort('question', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('question', QuestionSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Type',
        field: 'type',
        width: 120,
        sort: getSort('type', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('type', QuestionSortableColumns),
        comparator: DummySort,
        valueFormatter: (params) => (params.value === 'mcq' ? 'MCQ' : 'True/False'),
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
        minWidth: 180,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', QuestionSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<QuestionListResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<QuestionListResponseType>>,
      },
    ] satisfies ColDef<QuestionListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal]);

  const onActionClick = useCallback(
    async (action: string, data: QuestionListResponseType) => {
      switch (action) {
        case 'Edit': {
          const question = await getQuestionById(data.id);
          props.onEdit(question);
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
    <DataTableSimple<QuestionListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='question-table'
    />
  );
};

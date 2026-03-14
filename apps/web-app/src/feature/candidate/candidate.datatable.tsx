'use client';

import {
  CandidateListResponseType,
  CandidateProgressDtoEnum,
  CandidateSortableColumns,
  CandidateStatusDtoEnum,
  PaginatedResponseType,
} from '@repo/dto';
import { DataTableSimple, DummySort, getSort } from '@repo/ui/container/datatable/datatable';
import {
  ActionOption,
  ActionsIconCellRenderer,
  ActionsIconCellRendererParams,
  BadgeRenderer,
  DateTimeRenderer,
  EditableSelectCellRenderer,
} from '@repo/ui/container/datatable/datatable-cell-renderer';
import { isSortable } from '@repo/ui/lib/utils';
import { ColDef } from 'ag-grid-community';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { updateCandidateProgress, updateCandidateStatus } from '@/lib/action/candidate.actions';

interface Props {
  data: PaginatedResponseType<CandidateListResponseType>;
  sort: { sKey?: string; sVal?: string };
  onEdit: (candidate: CandidateListResponseType) => void;
  onDelete: (candidate: CandidateListResponseType) => void;
  onRefresh?: () => void;
}

const actionOptions: ActionOption[] = [
  { name: 'View', icon: Eye, variant: 'outline' },
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Delete', icon: Trash2, variant: 'outline-danger' },
];

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  planed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  notReachable: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  selected: 'bg-green-500/10 text-green-400 border-green-500/20',
  onHold: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const progressColors: Record<string, string> = {
  new: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  infoCollected: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  lev1InterviewScheduled: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  lev1InterviewCompleted: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  lev2InterviewScheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  lev2InterviewCompleted: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  offerReleased: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  offerAccepted: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const statusOptions = Object.values(CandidateStatusDtoEnum).map((v) => ({ value: v, label: v }));
const progressOptions = Object.values(CandidateProgressDtoEnum).map((v) => ({ value: v, label: v }));

export const CandidateDataTableClient = (props: Props) => {
  const router = useRouter();

  const onSaveStatus = useCallback(
    async (id: number, status: string) => {
      const r = await updateCandidateStatus(id, status as CandidateStatusDtoEnum);
      if (r.success) props.onRefresh?.();
      return r;
    },
    [props.onRefresh],
  );

  const onSaveProgress = useCallback(
    async (id: number, progress: string) => {
      const r = await updateCandidateProgress(id, progress as CandidateProgressDtoEnum);
      if (r.success) props.onRefresh?.();
      return r;
    },
    [props.onRefresh],
  );

  const colDefs = useMemo<ColDef<CandidateListResponseType>[]>(() => {
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
        sortable: isSortable('firstname', CandidateSortableColumns),
        comparator: DummySort,
        valueGetter: (params) => params.data ? `${params.data.firstname} ${params.data.lastname}` : '',
      },
      {
        headerName: 'Email',
        field: 'email',
        flex: 2,
        sort: getSort('email', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('email', CandidateSortableColumns),
        comparator: DummySort,
      },
      {
        headerName: 'Contact Numbers',
        field: 'contactNumbers',
        flex: 2,
        sortable: false,
        valueFormatter: (params) => (params.value?.length ? params.value.join(', ') : '—'),
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 160,
        sort: getSort('status', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('status', CandidateSortableColumns),
        comparator: DummySort,
        cellRenderer: EditableSelectCellRenderer,
        cellRendererParams: {
          options: statusOptions,
          badgeColors: statusColors,
          onSave: onSaveStatus,
          onRefresh: props.onRefresh,
        },
      },
      {
        headerName: 'Progress',
        field: 'progress',
        flex: 2,
        sort: getSort('progress', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('progress', CandidateSortableColumns),
        comparator: DummySort,
        cellRenderer: EditableSelectCellRenderer,
        cellRendererParams: {
          options: progressOptions,
          badgeColors: progressColors,
          onSave: onSaveProgress,
          onRefresh: props.onRefresh,
        },
      },
      {
        headerName: 'Source',
        field: 'source',
        width: 130,
        sort: getSort('source', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('source', CandidateSortableColumns),
        comparator: DummySort,
        valueFormatter: (params) => params.value ?? '—',
      },
      {
        headerName: 'Exp (yrs)',
        field: 'expInYears',
        width: 110,
        sortable: false,
        valueFormatter: (params) => params.value != null ? String(params.value) : '—',
      },
      {
        headerName: 'Skills',
        field: 'skills',
        flex: 3,
        sortable: false,
        autoHeight: true,
        cellRenderer: (params: { value?: string[] }) =>
          params.value?.length ? (
            <div className='flex flex-wrap items-center gap-1 py-1'>
              {params.value.map((skill, i) => (
                <BadgeRenderer key={i} text={skill} className='border border-border' />
              ))}
            </div>
          ) : '—',
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        minWidth: 200,
        sort: getSort('createdAt', props.sort.sKey, props.sort.sVal),
        sortable: isSortable('createdAt', CandidateSortableColumns),
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
        cellRenderer: ActionsIconCellRenderer<CandidateListResponseType>,
        cellRendererParams: {
          options: actionOptions,
        } satisfies Partial<ActionsIconCellRendererParams<CandidateListResponseType>>,
      },
    ] satisfies ColDef<CandidateListResponseType>[];
  }, [props.sort.sKey, props.sort.sVal, onSaveStatus, onSaveProgress, props.onRefresh]);

  const onActionClick = useCallback(
    async (action: string, data: CandidateListResponseType) => {
      switch (action) {
        case 'View':
          router.push(`/candidate/${data.id}/basic`);
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
    <DataTableSimple<CandidateListResponseType>
      colDefs={colDefs}
      onActionClick={onActionClick}
      pagination={{
        page: props.data.page,
        pageSize: props.data.limit,
        total: props.data.totalRecords,
      }}
      rowData={props.data.results}
      tableKey='candidate-table'
    />
  );
};
